using System.Net;
using System.Text;
using System.Text.Json;
using backend.Exceptions;
using backend.Services.Interfaces;

namespace backend.Services;

// Uses a Google Apps Script webhook over HTTPS for lightweight assessment emails.
public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(HttpClient httpClient, IConfiguration config, ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task SendVerificationCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Your Nintro verification code";
        var htmlBody = BuildVerificationEmail(firstName, code);
        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Reset your Nintro password";
        var htmlBody = BuildPasswordResetEmail(firstName, code);
        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string message)
    {
        var webhookUrl = GetConfig("EmailSettings:GoogleWebhookUrl", "GOOGLE_WEBHOOK_URL");
        var webhookSecret = GetConfig("EmailSettings:GoogleWebhookSecret", "GOOGLE_WEBHOOK_SECRET");
        var senderName = GetConfig("EmailSettings:FromName", "FROM_NAME") ?? "Nintro";

        if (IsMissingOrPlaceholder(webhookUrl))
        {
            _logger.LogError("Google email webhook config error: missing webhook URL.");
            throw new EmailDeliveryException("Email service configuration is missing.");
        }

        var payload = new
        {
            toEmail,
            subject,
            message,
            fromName = senderName,
            secret = webhookSecret
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(webhookUrl, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Google email webhook HTTP error. Status: {Status}, To: {ToEmail}, Body: {Error}",
                    response.StatusCode,
                    toEmail,
                    responseBody);

                if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    throw new EmailDeliveryException(
                        "Google webhook access denied. Redeploy the Apps Script web app with Execute as Me and Who has access set to Anyone.");
                }

                throw new EmailDeliveryException("Email webhook rejected the message. Please try again later.");
            }

            var webhookResult = JsonSerializer.Deserialize<GoogleWebhookResponse>(
                responseBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (!string.Equals(webhookResult?.Status, "success", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError(
                    "Google email webhook returned an error. To: {ToEmail}, Body: {Error}",
                    toEmail,
                    responseBody);

                throw new EmailDeliveryException(webhookResult?.Message ?? "Email webhook rejected the message.");
            }

            _logger.LogInformation("Email webhook sent successfully to {Email}", toEmail);
        }
        catch (EmailDeliveryException)
        {
            throw;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timed out while sending email to {Email}", toEmail);
            throw new EmailDeliveryException("Email webhook timed out. Please try again later.", ex);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Network error while sending email to {Email}", toEmail);
            throw new EmailDeliveryException("Email webhook is currently unreachable. Please try again later.", ex);
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Invalid response from email webhook while sending to {Email}", toEmail);
            throw new EmailDeliveryException("Email webhook returned an invalid response. Please try again later.", ex);
        }
    }

    private static string BuildVerificationEmail(string firstName, string code) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:'Segoe UI',sans-serif;background:#020509;padding:40px;margin:0">
          <div style="max-width:480px;margin:auto;background:#050d14;border:1px solid #0f1d28;border-radius:16px;padding:40px">
            <div style="margin-bottom:28px">
              <div style="width:36px;height:36px;background:#16a34a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:18px">N</span>
              </div>
              <span style="color:#f0f6ff;font-weight:700;font-size:16px;margin-left:10px;vertical-align:middle">Nintro</span>
            </div>
            <h2 style="color:#f0f6ff;margin:0 0 8px;font-size:22px;font-weight:800">Verify your email</h2>
            <p style="color:#8fa3b8;margin:0 0 28px;font-size:14px;line-height:1.6">
              Hi {firstName}, welcome to Nintro! Enter the code below to verify your email address.
            </p>
            <div style="background:#081018;border:2px dashed #16a34a;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
              <span style="font-size:40px;font-weight:900;letter-spacing:14px;color:#4ade80;font-family:monospace">{code}</span>
            </div>
            <p style="color:#3d5166;font-size:13px;margin:0 0 8px">
              This code expires in <strong style="color:#8fa3b8">2 minutes</strong>.
            </p>
            <p style="color:#3d5166;font-size:13px;margin:0">
              If you didn't create a Nintro account, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
        """;

    private static string BuildPasswordResetEmail(string firstName, string code) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:'Segoe UI',sans-serif;background:#020509;padding:40px;margin:0">
          <div style="max-width:480px;margin:auto;background:#050d14;border:1px solid #0f1d28;border-radius:16px;padding:40px">
            <div style="margin-bottom:28px">
              <div style="width:36px;height:36px;background:#16a34a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:18px">N</span>
              </div>
              <span style="color:#f0f6ff;font-weight:700;font-size:16px;margin-left:10px;vertical-align:middle">Nintro</span>
            </div>
            <h2 style="color:#f0f6ff;margin:0 0 8px;font-size:22px;font-weight:800">Reset your password</h2>
            <p style="color:#8fa3b8;margin:0 0 28px;font-size:14px;line-height:1.6">
              Hi {firstName}, use the code below to reset your Nintro password.
            </p>
            <div style="background:#081018;border:2px dashed #f87171;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
              <span style="font-size:40px;font-weight:900;letter-spacing:14px;color:#f87171;font-family:monospace">{code}</span>
            </div>
            <p style="color:#3d5166;font-size:13px;margin:0 0 8px">
              This code expires in <strong style="color:#8fa3b8">2 minutes</strong>.
            </p>
            <p style="color:#3d5166;font-size:13px;margin:0">
              If you didn't request this reset, please secure your account immediately.
            </p>
          </div>
        </body>
        </html>
        """;

    private string? GetConfig(string primaryKey, string fallbackKey)
    {
        var value = _config[primaryKey];
        return IsMissingOrPlaceholder(value) ? _config[fallbackKey] : value;
    }

    private static bool IsMissingOrPlaceholder(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ||
               value.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase) ||
               value.Contains("placeholder", StringComparison.OrdinalIgnoreCase) ||
               value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase);
    }

    private sealed record GoogleWebhookResponse(string? Status, string? Message);
}

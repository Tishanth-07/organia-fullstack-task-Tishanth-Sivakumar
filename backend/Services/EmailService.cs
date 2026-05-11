using System.Net;
using System.Net.Mail;
using backend.Services.Interfaces;

namespace backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendVerificationCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Verify your Nintro account";
        var body = BuildVerificationEmail(firstName, code);
        await SendAsync(toEmail, subject, body);
    }

    public async Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Reset your Nintro password";
        var body = BuildPasswordResetEmail(firstName, code);
        await SendAsync(toEmail, subject, body);
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpHost     = _config["EmailSettings:SmtpHost"]!;
        var smtpPort     = int.Parse(_config["EmailSettings:SmtpPort"]!);
        var smtpUser     = _config["EmailSettings:SmtpUser"]!;
        var smtpPassword = _config["EmailSettings:SmtpPassword"]!;
        var fromEmail    = _config["EmailSettings:FromEmail"]!;
        var fromName     = _config["EmailSettings:FromName"] ?? "Nintro";

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPassword),
            EnableSsl   = true
        };

        var message = new MailMessage
        {
            From       = new MailAddress(fromEmail, fromName),
            Subject    = subject,
            Body       = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw new InvalidOperationException("Failed to send email. Please try again.");
        }
    }

    // ── Email Templates ───────────────────────────────────────────────────────

    private static string BuildVerificationEmail(string firstName, string code) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#f4f4f4;padding:40px">
          <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:40px">
            <h2 style="color:#16a34a;margin-bottom:8px">Verify your email</h2>
            <p>Hi {firstName}, welcome to Nintro! Use the code below to verify your email address.</p>
            <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#15803d">{code}</span>
            </div>
            <p style="color:#6b7280;font-size:14px">This code expires in <strong>2 minutes</strong>. Do not share it with anyone.</p>
            <p style="color:#6b7280;font-size:14px">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
        """;

    private static string BuildPasswordResetEmail(string firstName, string code) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#f4f4f4;padding:40px">
          <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:40px">
            <h2 style="color:#dc2626;margin-bottom:8px">Reset your password</h2>
            <p>Hi {firstName}, use the code below to reset your Nintro password.</p>
            <div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#dc2626">{code}</span>
            </div>
            <p style="color:#6b7280;font-size:14px">This code expires in <strong>2 minutes</strong>. Do not share it with anyone.</p>
            <p style="color:#6b7280;font-size:14px">If you didn't request this, please secure your account immediately.</p>
          </div>
        </body>
        </html>
        """;
}
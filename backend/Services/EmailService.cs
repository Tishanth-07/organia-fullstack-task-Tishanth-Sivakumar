using System.Net;
using System.Net.Mail;
using backend.Services.Interfaces;

namespace backend.Services;

/// <summary>
/// Service for sending transactional emails (Verification, Password Reset) via SMTP.
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Sends a 6-digit verification code to a new user.
    /// </summary>
    public async Task SendVerificationCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Verify your Nintro account";
        var body = BuildVerificationEmail(firstName, code);
        await SendAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Sends a 6-digit password reset code to an existing user.
    /// </summary>
    public async Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code)
    {
        var subject = "Reset your Nintro password";
        var body = BuildPasswordResetEmail(firstName, code);
        await SendAsync(toEmail, subject, body);
    }

    /// <summary>
    /// Core method to handle SMTP transmission.
    /// </summary>
    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        // 1. Ingest SMTP configuration from appsettings or environment
        var smtpHost     = _config["EmailSettings:SmtpHost"]!;
        var smtpPortStr  = _config["EmailSettings:SmtpPort"] ?? "587";
        var smtpUser     = _config["EmailSettings:SmtpUser"]!;
        var smtpPassword = _config["EmailSettings:SmtpPassword"]!;
        var fromEmail    = _config["EmailSettings:FromEmail"]!;
        var fromName     = _config["EmailSettings:FromName"] ?? "Nintro Support";

        if (!int.TryParse(smtpPortStr, out var smtpPort)) smtpPort = 587;

        // 2. Setup SMTP Client
        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPassword),
            EnableSsl   = true
        };

        // 3. Construct Email Message
        var message = new MailMessage
        {
            From       = new MailAddress(fromEmail, fromName),
            Subject    = subject,
            Body       = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        // 4. Transmission with error logging
        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Successfully sent email to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            // We throw a generic error to the frontend to avoid leaking SMTP details.
            // Using base Exception ensures this is treated as a 500 Internal Server Error.
            throw new Exception("We encountered an issue sending the email. Please try again later.");
        }
    }

    // ── Email Templates (HTML) ────────────────────────────────────────────────
    
    private static string BuildVerificationEmail(string firstName, string code) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#f4f4f4;padding:40px">
          <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:40px">
            <h2 style="color:#6366f1;margin-bottom:8px">Verify your email</h2>
            <p>Hi {firstName}, welcome to Nintro! Use the code below to verify your email address.</p>
            <div style="background:#f5f3ff;border:2px dashed #6366f1;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#4f46e5">{code}</span>
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
            <h2 style="color:#6366f1;margin-bottom:8px">Reset your password</h2>
            <p>Hi {firstName}, use the code below to reset your Nintro password.</p>
            <div style="background:#f5f3ff;border:2px dashed #6366f1;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#4f46e5">{code}</span>
            </div>
            <p style="color:#6b7280;font-size:14px">This code expires in <strong>2 minutes</strong>. Do not share it with anyone.</p>
            <p style="color:#6b7280;font-size:14px">If you didn't request this, please secure your account immediately.</p>
          </div>
        </body>
        </html>
        """;
}
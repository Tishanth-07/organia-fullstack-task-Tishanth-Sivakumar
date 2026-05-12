using backend.Services.Interfaces;
using Resend;

namespace backend.Services;

// Uses Resend HTTP API (port 443) — works on ALL platforms including Render free tier.
// Old SmtpClient used port 587 which Render blocked on Sep 26 2025.
public class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IResend resend, IConfiguration config, ILogger<EmailService> logger)
    {
        _resend = resend;
        _config = config;
        _logger = logger;
    }

    public async Task SendVerificationCodeAsync(string toEmail, string firstName, string code)
    {
        var message = new EmailMessage();

        // Free Resend tier: must use onboarding@resend.dev until you verify a domain
        // Once domain verified: change to your actual from address from config
        message.From = GetFromAddress();
        message.To.Add(toEmail);
        message.Subject = "Your Nintro verification code";
        message.HtmlBody = BuildVerificationEmail(firstName, code);

        await SendAsync(message, toEmail);
    }

    public async Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code)
    {
        var message = new EmailMessage();
        message.From = GetFromAddress();
        message.To.Add(toEmail);
        message.Subject = "Reset your Nintro password";
        message.HtmlBody = BuildPasswordResetEmail(firstName, code);

        await SendAsync(message, toEmail);
    }

    private async Task SendAsync(EmailMessage message, string toEmail)
    {
        try
        {
            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw new InvalidOperationException("Failed to send email. Please try again later.");
        }
    }

    // Returns "Name <email>" format
    private string GetFromAddress()
    {
        var fromName  = _config["EmailSettings:FromName"]  ?? "Nintro";
        var fromEmail = _config["EmailSettings:FromEmail"] ?? "onboarding@resend.dev";
        return $"{fromName} <{fromEmail}>";
    }

    // ── Email Templates ───────────────────────────────────────────────────────

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
              ⏱ This code expires in <strong style="color:#8fa3b8">2 minutes</strong>.
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
              ⏱ This code expires in <strong style="color:#8fa3b8">2 minutes</strong>.
            </p>
            <p style="color:#3d5166;font-size:13px;margin:0">
              If you didn't request this reset, please secure your account immediately.
            </p>
          </div>
        </body>
        </html>
        """;
}
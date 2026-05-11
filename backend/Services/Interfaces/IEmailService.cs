namespace backend.Services.Interfaces;

/// <summary>
/// Contract for email notification services.
/// </summary>
public interface IEmailService
{
    /// <summary>Sends a 6-digit verification code email.</summary>
    Task SendVerificationCodeAsync(string toEmail, string firstName, string code);

    /// <summary>Sends a 6-digit password reset code email.</summary>
    Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code);
}
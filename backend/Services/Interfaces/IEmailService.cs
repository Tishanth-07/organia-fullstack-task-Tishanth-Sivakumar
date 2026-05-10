namespace backend.Services.Interfaces;

public interface IEmailService
{
    Task SendVerificationCodeAsync(string toEmail, string firstName, string code);
    Task SendPasswordResetCodeAsync(string toEmail, string firstName, string code);
}
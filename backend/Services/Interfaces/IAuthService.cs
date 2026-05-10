using backend.DTOs.Auth;

namespace backend.Services.Interfaces;

public interface IAuthService
{
    Task<MessageResponseDto> RegisterAsync(RegisterDto dto);
    Task<MessageResponseDto> VerifyEmailAsync(VerifyEmailDto dto);
    Task<MessageResponseDto> ResendVerificationCodeAsync(ResendVerificationDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto);
}
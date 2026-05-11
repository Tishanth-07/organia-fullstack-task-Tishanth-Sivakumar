using backend.DTOs.Auth;

namespace backend.Services.Interfaces;

/// <summary>
/// Contract for authentication and user account management services.
/// </summary>
public interface IAuthService
{
    /// <summary>Registers a new user account.</summary>
    Task<MessageResponseDto> RegisterAsync(RegisterDto dto);

    /// <summary>Verifies email using a 6-digit code.</summary>
    Task<MessageResponseDto> VerifyEmailAsync(VerifyEmailDto dto);

    /// <summary>Resends a verification code to the user.</summary>
    Task<MessageResponseDto> ResendVerificationCodeAsync(ResendVerificationDto dto);

    /// <summary>Authenticates a user and returns a token.</summary>
    Task<AuthResponseDto> LoginAsync(LoginDto dto);

    /// <summary>Initiates the forgotten password flow.</summary>
    Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto);

    /// <summary>Resets a user's password using a reset code.</summary>
    Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto);
}
namespace backend.DTOs.Auth;

/// <summary>Data required to register a new user.</summary>
public record RegisterDto(string FirstName, string LastName, string Email, string Password);

/// <summary>Credentials required to authenticate a user.</summary>
public record LoginDto(string Email, string Password);

/// <summary>Data required to verify an email address.</summary>
public record VerifyEmailDto(string Email, string Code);

/// <summary>Data required to resend a verification code.</summary>
public record ResendVerificationDto(string Email);

/// <summary>Data required to initiate a password reset.</summary>
public record ForgotPasswordDto(string Email);

/// <summary>Data required to complete a password reset.</summary>
public record ResetPasswordDto(string Email, string Code, string NewPassword);

/// <summary>Standard message response for non-data API results.</summary>
public record MessageResponseDto(string Message);

/// <summary>Response data containing the JWT token and user profile.</summary>
public record AuthResponseDto(string Token, string Email, string FirstName, string LastName, string Role);
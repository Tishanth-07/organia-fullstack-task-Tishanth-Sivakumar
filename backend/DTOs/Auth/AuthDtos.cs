namespace backend.DTOs.Auth;

// ── Register ─────────────────────────────────────────────
public record RegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string Password
);

// ── Verify Email ──────────────────────────────────────────
public record VerifyEmailDto(
    string Email,
    string Code          // 6-digit OTP
);

// ── Resend Verification Code ──────────────────────────────
public record ResendVerificationDto(
    string Email
);

// ── Login ─────────────────────────────────────────────────
public record LoginDto(
    string Email,
    string Password
);

// ── Forgot Password ───────────────────────────────────────
public record ForgotPasswordDto(
    string Email
);

// ── Reset Password ────────────────────────────────────────
public record ResetPasswordDto(
    string Email,
    string Code,
    string NewPassword
);

// ── Auth Response (returned on successful login) ──────────
public record AuthResponseDto(
    string Token,
    string Email,
    string FirstName,
    string LastName,
    string Role
);

// ── Generic Message Response ──────────────────────────────
public record MessageResponseDto(
    string Message
);
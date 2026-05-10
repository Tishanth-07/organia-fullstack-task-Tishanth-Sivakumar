using backend.Data;
using backend.DTOs.Auth;
using backend.Entities;
using backend.Helpers;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly JwtHelper _jwt;
    private readonly ILogger<AuthService> _logger;

    // Account lockout settings
    private const int MaxFailedAttempts  = 5;
    private const int LockoutMinutes     = 15;

    // OTP settings
    private const int OtpExpiryMinutes   = 2;
    private const int ResendCooldownSecs  = 60; // prevent spam

    public AuthService(AppDbContext db, IEmailService email, JwtHelper jwt, ILogger<AuthService> logger)
    {
        _db     = db;
        _email  = email;
        _jwt    = jwt;
        _logger = logger;
    }

    // ── REGISTER ─────────────────────────────────────────────────────────────

    public async Task<MessageResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Validate password strength
        if (!PasswordHelper.IsValid(dto.Password))
            throw new ArgumentException(PasswordHelper.GetStrengthMessage());

        // Normalize email
        var email = dto.Email.Trim().ToLowerInvariant();

        // Check if email already registered
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (existing != null)
        {
            // If already verified — tell them to login
            if (existing.IsEmailVerified)
                throw new InvalidOperationException("An account with this email already exists. Please log in.");

            // If registered but not verified — resend code (don't reveal they exist)
            await SendAndSaveVerificationCodeAsync(existing);
            await _db.SaveChangesAsync();
            return new MessageResponseDto("A new verification code has been sent to your email.");
        }

        // Validate name fields
        if (string.IsNullOrWhiteSpace(dto.FirstName) || dto.FirstName.Length > 50)
            throw new ArgumentException("First name must be between 1 and 50 characters.");
        if (string.IsNullOrWhiteSpace(dto.LastName) || dto.LastName.Length > 50)
            throw new ArgumentException("Last name must be between 1 and 50 characters.");

        // Create user
        var user = new User
        {
            FirstName    = dto.FirstName.Trim(),
            LastName     = dto.LastName.Trim(),
            Email        = email,
            PasswordHash = PasswordHelper.Hash(dto.Password),
            Role         = UserRole.User,
        };

        await SendAndSaveVerificationCodeAsync(user);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new MessageResponseDto("Account created. Please check your email for a 6-digit verification code.");
    }

    // ── VERIFY EMAIL ──────────────────────────────────────────────────────────

    public async Task<MessageResponseDto> VerifyEmailAsync(VerifyEmailDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email)
                    ?? throw new KeyNotFoundException("No account found with this email.");

        if (user.IsEmailVerified)
            return new MessageResponseDto("Email already verified. Please log in.");

        if (user.EmailVerificationCodeHash == null || user.EmailVerificationCodeExpiry == null)
            throw new InvalidOperationException("No verification code found. Please request a new one.");

        // Check expiry
        if (DateTime.UtcNow > user.EmailVerificationCodeExpiry)
            throw new InvalidOperationException("Verification code has expired. Please request a new one.");

        // Verify OTP
        if (!OtpHelper.Verify(dto.Code.Trim(), user.EmailVerificationCodeHash))
            throw new UnauthorizedAccessException("Invalid verification code.");

        // Mark verified and clear code
        user.IsEmailVerified             = true;
        user.EmailVerificationCodeHash   = null;
        user.EmailVerificationCodeExpiry = null;

        await _db.SaveChangesAsync();

        return new MessageResponseDto("Email verified successfully. You can now log in.");
    }

    // ── RESEND VERIFICATION CODE ──────────────────────────────────────────────

    public async Task<MessageResponseDto> ResendVerificationCodeAsync(ResendVerificationDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Always return same message to prevent email enumeration
        if (user == null || user.IsEmailVerified)
            return new MessageResponseDto("If your email is registered and unverified, a new code has been sent.");

        // Rate limit: 60 seconds between sends
        if (user.LastVerificationCodeSentAt.HasValue &&
            (DateTime.UtcNow - user.LastVerificationCodeSentAt.Value).TotalSeconds < ResendCooldownSecs)
        {
            var wait = ResendCooldownSecs - (int)(DateTime.UtcNow - user.LastVerificationCodeSentAt.Value).TotalSeconds;
            throw new InvalidOperationException($"Please wait {wait} seconds before requesting a new code.");
        }

        await SendAndSaveVerificationCodeAsync(user);
        await _db.SaveChangesAsync();

        return new MessageResponseDto("A new verification code has been sent to your email.");
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Generic message — prevent user enumeration
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        // Check lockout
        if (user.IsLockedOut)
        {
            var remaining = (int)(user.LockoutEnd!.Value - DateTime.UtcNow).TotalMinutes + 1;
            throw new InvalidOperationException($"Account locked due to too many failed attempts. Try again in {remaining} minute(s).");
        }

        // Verify password
        if (!PasswordHelper.Verify(dto.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= MaxFailedAttempts)
            {
                user.LockoutEnd          = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                user.FailedLoginAttempts = 0;
                await _db.SaveChangesAsync();
                throw new InvalidOperationException($"Too many failed attempts. Account locked for {LockoutMinutes} minutes.");
            }
            await _db.SaveChangesAsync();
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Check email verified
        if (!user.IsEmailVerified)
            throw new InvalidOperationException("Please verify your email before logging in.");

        // Reset failed attempts on success
        user.FailedLoginAttempts = 0;
        user.LockoutEnd          = null;
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);

        return new AuthResponseDto(token, user.Email, user.FirstName, user.LastName, user.Role.ToString());
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────────

    public async Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Always return same message — prevent email enumeration
        if (user == null || !user.IsEmailVerified)
            return new MessageResponseDto("If your email is registered, a reset code has been sent.");

        // Rate limit
        if (user.LastVerificationCodeSentAt.HasValue &&
            (DateTime.UtcNow - user.LastVerificationCodeSentAt.Value).TotalSeconds < ResendCooldownSecs)
        {
            var wait = ResendCooldownSecs - (int)(DateTime.UtcNow - user.LastVerificationCodeSentAt.Value).TotalSeconds;
            throw new InvalidOperationException($"Please wait {wait} seconds before requesting a new code.");
        }

        var code = OtpHelper.Generate();

        user.PasswordResetCodeHash   = OtpHelper.Hash(code);
        user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes);
        user.LastVerificationCodeSentAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _email.SendPasswordResetCodeAsync(user.Email, user.FirstName, code);

        return new MessageResponseDto("If your email is registered, a reset code has been sent.");
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────────

    public async Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email)
                    ?? throw new KeyNotFoundException("No account found with this email.");

        if (user.PasswordResetCodeHash == null || user.PasswordResetCodeExpiry == null)
            throw new InvalidOperationException("No reset code found. Please request a new one.");

        if (DateTime.UtcNow > user.PasswordResetCodeExpiry)
            throw new InvalidOperationException("Reset code has expired. Please request a new one.");

        if (!OtpHelper.Verify(dto.Code.Trim(), user.PasswordResetCodeHash))
            throw new UnauthorizedAccessException("Invalid reset code.");

        if (!PasswordHelper.IsValid(dto.NewPassword))
            throw new ArgumentException(PasswordHelper.GetStrengthMessage());

        user.PasswordHash          = PasswordHelper.Hash(dto.NewPassword);
        user.PasswordResetCodeHash = null;
        user.PasswordResetCodeExpiry = null;

        // Reset lockout on password change
        user.FailedLoginAttempts = 0;
        user.LockoutEnd          = null;

        await _db.SaveChangesAsync();

        return new MessageResponseDto("Password reset successfully. You can now log in.");
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private async Task SendAndSaveVerificationCodeAsync(User user)
    {
        var code = OtpHelper.Generate();
        user.EmailVerificationCodeHash   = OtpHelper.Hash(code);
        user.EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes);
        user.LastVerificationCodeSentAt  = DateTime.UtcNow;

        await _email.SendVerificationCodeAsync(user.Email, user.FirstName, code);
    }
}
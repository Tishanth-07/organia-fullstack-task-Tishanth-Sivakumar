using backend.Data;
using backend.DTOs.Auth;
using backend.Entities;
using backend.Helpers;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Service responsible for managing user authentication, registration, 
/// email verification, and password recovery.
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly JwtHelper _jwt;
    private readonly ILogger<AuthService> _logger;

    // Security configuration constants
    private const int MaxFailedAttempts  = 5;
    private const int LockoutMinutes     = 15;
    private const int OtpExpiryMinutes   = 2;
    private const int ResendCooldownSecs  = 60;

    public AuthService(AppDbContext db, IEmailService email, JwtHelper jwt, ILogger<AuthService> logger)
    {
        _db     = db;
        _email  = email;
        _jwt    = jwt;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user account. If the email is already registered but unverified, 
    /// a new verification code is sent.
    /// </summary>
    /// <param name="dto">Registration data transfer object.</param>
    /// <returns>A message response indicating next steps.</returns>
    /// <exception cref="ArgumentException">Thrown for validation errors.</exception>
    /// <exception cref="InvalidOperationException">Thrown if email is already verified.</exception>
    public async Task<MessageResponseDto> RegisterAsync(RegisterDto dto)
    {
        // 1. Password Strength Validation
        if (!PasswordHelper.IsValid(dto.Password))
            throw new ArgumentException(PasswordHelper.GetStrengthMessage());

        var email = dto.Email.Trim().ToLowerInvariant();

        // 2. Check for Existing Account
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existing != null)
        {
            if (existing.IsEmailVerified)
                throw new InvalidOperationException("An account with this email already exists. Please log in.");

            // Resend verification code if already registered but not verified
            await SendAndSaveVerificationCodeAsync(existing);
            await _db.SaveChangesAsync();
            return new MessageResponseDto("A new verification code has been sent to your email.");
        }

        // 3. Name Validation
        if (string.IsNullOrWhiteSpace(dto.FirstName) || dto.FirstName.Length > 50)
            throw new ArgumentException("First name must be between 1 and 50 characters.");
        if (string.IsNullOrWhiteSpace(dto.LastName) || dto.LastName.Length > 50)
            throw new ArgumentException("Last name must be between 1 and 50 characters.");

        // 4. Create and Save User
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

    /// <summary>
    /// Verifies a user's email address using a 6-digit OTP code.
    /// </summary>
    public async Task<MessageResponseDto> VerifyEmailAsync(VerifyEmailDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email)
                    ?? throw new KeyNotFoundException("No account found with this email.");

        if (user.IsEmailVerified)
            return new MessageResponseDto("Email already verified. Please log in.");

        if (user.EmailVerificationCodeHash == null || user.EmailVerificationCodeExpiry == null)
            throw new InvalidOperationException("No verification code found. Please request a new one.");

        if (DateTime.UtcNow > user.EmailVerificationCodeExpiry)
            throw new InvalidOperationException("Verification code has expired. Please request a new one.");

        if (!OtpHelper.Verify(dto.Code.Trim(), user.EmailVerificationCodeHash))
            throw new UnauthorizedAccessException("Invalid verification code.");

        user.IsEmailVerified             = true;
        user.EmailVerificationCodeHash   = null;
        user.EmailVerificationCodeExpiry = null;

        await _db.SaveChangesAsync();
        return new MessageResponseDto("Email verified successfully. You can now log in.");
    }

    /// <summary>
    /// Resends the email verification code, respecting a rate-limit cooldown.
    /// </summary>
    public async Task<MessageResponseDto> ResendVerificationCodeAsync(ResendVerificationDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || user.IsEmailVerified)
            return new MessageResponseDto("If your email is registered and unverified, a new code has been sent.");

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

    /// <summary>
    /// Authenticates a user and generates a JWT token on success.
    /// Implements account lockout protection.
    /// </summary>
    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (user.IsLockedOut)
        {
            var remaining = (int)(user.LockoutEnd!.Value - DateTime.UtcNow).TotalMinutes + 1;
            throw new InvalidOperationException($"Account locked due to too many failed attempts. Try again in {remaining} minute(s).");
        }

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

        if (!user.IsEmailVerified)
            throw new InvalidOperationException("Please verify your email before logging in.");

        user.FailedLoginAttempts = 0;
        user.LockoutEnd          = null;
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);
        return new AuthResponseDto(token, user.Email, user.FirstName, user.LastName, user.Role.ToString());
    }

    /// <summary>
    /// Initiates the password recovery flow by sending an OTP to the user's email.
    /// </summary>
    public async Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user  = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !user.IsEmailVerified)
            return new MessageResponseDto("If your email is registered, a reset code has been sent.");

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

    /// <summary>
    /// Resets a user's password using the OTP code provided via email.
    /// </summary>
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
        user.FailedLoginAttempts   = 0;
        user.LockoutEnd            = null;

        await _db.SaveChangesAsync();
        return new MessageResponseDto("Password reset successfully. You can now log in.");
    }

    private async Task SendAndSaveVerificationCodeAsync(User user)
    {
        var code = OtpHelper.Generate();
        user.EmailVerificationCodeHash   = OtpHelper.Hash(code);
        user.EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes);
        user.LastVerificationCodeSentAt  = DateTime.UtcNow;

        await _email.SendVerificationCodeAsync(user.Email, user.FirstName, code);
    }
}
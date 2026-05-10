namespace backend.Entities;

public enum UserRole
{
    User,
    Admin
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // BCrypt hashed — never plain text
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.User;

    // ── Email Verification ────────────────────────────────
    public bool IsEmailVerified { get; set; } = false;

    // 6-digit OTP stored as BCrypt hash
    public string? EmailVerificationCodeHash { get; set; }
    public DateTime? EmailVerificationCodeExpiry { get; set; }

    // ── Password Reset ────────────────────────────────────
    public string? PasswordResetCodeHash { get; set; }
    public DateTime? PasswordResetCodeExpiry { get; set; }

    // ── Security ──────────────────────────────────────────
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }

    // Track last code send time — rate limiting
    public DateTime? LastVerificationCodeSentAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // Helpers
    public string FullName => $"{FirstName} {LastName}";
    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd.Value > DateTime.UtcNow;
}
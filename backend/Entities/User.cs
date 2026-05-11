namespace backend.Entities;

/// <summary>
/// Defines the available authorization roles within the system.
/// </summary>
public enum UserRole
{
    User,
    Admin
}

/// <summary>
/// Represents a user account within the system, including security, 
/// verification, and profile data.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // ── Profile Information ──────────────────────────────────────────────────
    
    public string FirstName { get; set; } = string.Empty;
    public string LastName  { get; set; } = string.Empty;
    public string Email     { get; set; } = string.Empty;

    // ── Security & Authentication ────────────────────────────────────────────
    
    /// <summary>Stored as a BCrypt hash. Never store plain-text passwords.</summary>
    public string PasswordHash { get; set; } = string.Empty;
    
    public UserRole Role { get; set; } = UserRole.User;

    // ── Account Verification (OTP) ───────────────────────────────────────────
    
    public bool IsEmailVerified { get; set; } = false;

    /// <summary>6-digit code stored as a BCrypt hash for security.</summary>
    public string? EmailVerificationCodeHash { get; set; }
    public DateTime? EmailVerificationCodeExpiry { get; set; }

    // ── Password Recovery ────────────────────────────────────────────────────
    
    /// <summary>6-digit reset code stored as a BCrypt hash.</summary>
    public string? PasswordResetCodeHash { get; set; }
    public DateTime? PasswordResetCodeExpiry { get; set; }

    // ── Protection & Rate Limiting ───────────────────────────────────────────
    
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }

    /// <summary>Used to enforce cooldown periods between sending codes (e.g., 60s).</summary>
    public DateTime? LastVerificationCodeSentAt { get; set; }

    // ── Metadata ─────────────────────────────────────────────────────────────
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation Properties ────────────────────────────────────────────────
    
    /// <summary>Tasks owned by this user.</summary>
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();

    // ── Computed Helpers ─────────────────────────────────────────────────────
    
    public string FullName => $"{FirstName} {LastName}";
    
    /// <summary>Returns true if the account is currently locked due to failed attempts.</summary>
    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd.Value > DateTime.UtcNow;
}
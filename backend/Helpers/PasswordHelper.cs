using System.Text.RegularExpressions;
using BCrypt.Net;

namespace backend.Helpers;

/// <summary>
/// Static utility class for password validation, hashing, and verification using BCrypt.
/// </summary>
public static class PasswordHelper
{
    // Regex requirements: Minimum 8 characters, at least 1 uppercase, 1 number, and 1 special symbol.
    private static readonly Regex PasswordRegex = new(
        @"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$",
        RegexOptions.Compiled
    );

    /// <summary>
    /// Validates a password against the security policy.
    /// </summary>
    public static bool IsValid(string password) => PasswordRegex.IsMatch(password);

    /// <summary>
    /// Hashes a plain-text password using BCrypt with a high cost factor for security.
    /// </summary>
    public static string Hash(string password)
    {
        if (string.IsNullOrEmpty(password)) throw new System.ArgumentException("Password cannot be empty");
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    /// <summary>
    /// Verifies a plain-text password against a stored hash.
    /// </summary>
    public static bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);

    /// <summary>
    /// Returns a user-friendly message describing the password policy.
    /// </summary>
    public static string GetStrengthMessage() =>
        "Password must be at least 8 characters and include an uppercase letter, a number, and a symbol.";
}
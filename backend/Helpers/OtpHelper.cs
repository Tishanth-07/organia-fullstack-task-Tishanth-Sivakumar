using System.Security.Cryptography;

namespace backend.Helpers;

/// <summary>
/// Static utility class for managing 6-digit verification codes (OTP).
/// Uses cryptographically secure randomness and one-way hashing for storage.
/// </summary>
public static class OtpHelper
{
    /// <summary>
    /// Generates a cryptographically secure, random 6-digit numeric code.
    /// </summary>
    /// <returns>A 6-digit string (e.g., "052931").</returns>
    public static string Generate()
    {
        // Use RandomNumberGenerator for industrial-strength randomness
        var bytes = new byte[4];
        RandomNumberGenerator.Fill(bytes);
        
        // Ensure the number is positive and exactly 6 digits
        var number = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1_000_000;
        return number.ToString("D6"); // Zero-padded to 6 digits
    }

    /// <summary>
    /// Hashes an OTP string using BCrypt before it is stored in the database.
    /// </summary>
    public static string Hash(string otp) =>
        BCrypt.Net.BCrypt.HashPassword(otp, workFactor: 10);

    /// <summary>
    /// Verifies a raw OTP input against its stored hashed version.
    /// </summary>
    public static bool Verify(string otp, string hash) =>
        BCrypt.Net.BCrypt.Verify(otp, hash);
}
using System.Security.Cryptography;

namespace backend.Helpers;

public static class OtpHelper
{
    /// <summary>Generates a cryptographically random 6-digit OTP.</summary>
    public static string Generate()
    {
        // Use RandomNumberGenerator for crypto-safe randomness
        var bytes = new byte[4];
        RandomNumberGenerator.Fill(bytes);
        var number = Math.Abs(BitConverter.ToInt32(bytes, 0)) % 1_000_000;
        return number.ToString("D6"); // always 6 digits, zero-padded
    }

    /// <summary>Hashes the OTP with BCrypt before storing in DB.</summary>
    public static string Hash(string otp) =>
        BCrypt.Net.BCrypt.HashPassword(otp, workFactor: 10);

    /// <summary>Verifies a plain OTP against the stored hash.</summary>
    public static bool Verify(string otp, string hash) =>
        BCrypt.Net.BCrypt.Verify(otp, hash);
}
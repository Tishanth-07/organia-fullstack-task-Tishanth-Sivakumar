using System.Text.RegularExpressions;
using BCrypt.Net;

namespace backend.Helpers;

public static class PasswordHelper
{
    // Minimum 8 chars, 1 uppercase, 1 number, 1 symbol
    private static readonly Regex PasswordRegex = new(
        @"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]).{8,}$",
        RegexOptions.Compiled
    );

    public static bool IsValid(string password) => PasswordRegex.IsMatch(password);

    public static string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

    public static bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);

    public static string GetStrengthMessage() =>
        "Password must be at least 8 characters and include an uppercase letter, a number, and a symbol.";
}
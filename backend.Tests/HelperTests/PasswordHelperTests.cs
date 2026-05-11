// =============================================================================
//  PasswordHelperTests.cs
//  Place at: backend.Tests/HelperTests/PasswordHelperTests.cs
//
//  WHAT IS TESTED: backend/Helpers/PasswordHelper.cs
//
//  PURPOSE: Password hashing is the foundation of authentication security.
//  These tests verify that hashing uses unique salts, verification works 
//  correctly for matching/mismatched inputs, and edge cases are handled.
// =============================================================================

using backend.Helpers;
using FluentAssertions;

namespace backend.Tests.HelperTests;

/// <summary>
/// Unit tests for the <see cref="PasswordHelper"/> utility class.
/// </summary>
public class PasswordHelperTests
{
    /// <summary>
    /// Verifies that hashing a password does not return the input string itself.
    /// </summary>
    [Fact]
    public void Hash_ReturnsHashedString_NotPlainText()
    {
        // Arrange
        const string plainPassword = "MyPassword123!";

        // Act
        string hash = PasswordHelper.Hash(plainPassword);

        // Assert
        hash.Should().NotBe(plainPassword);
        hash.Should().NotBeNullOrEmpty();
    }

    /// <summary>
    /// Verifies that BCrypt's salting mechanism works by producing different hashes 
    /// for the same password input.
    /// </summary>
    [Fact]
    public void Hash_SamePassword_ProducesDifferentHashes()
    {
        // Arrange
        const string plainPassword = "MyPassword123!";

        // Act
        string hash1 = PasswordHelper.Hash(plainPassword);
        string hash2 = PasswordHelper.Hash(plainPassword);

        // Assert
        hash1.Should().NotBe(hash2, "each hash must have a unique random salt to prevent rainbow table attacks");
    }

    /// <summary>
    /// Verifies that <see cref="PasswordHelper.Verify"/> returns true when 
    /// the correct password is provided for a valid hash.
    /// </summary>
    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        // Arrange
        const string plainPassword = "MyPassword123!";
        string hash = PasswordHelper.Hash(plainPassword);

        // Act
        bool result = PasswordHelper.Verify(plainPassword, hash);

        // Assert
        result.Should().BeTrue();
    }

    /// <summary>
    /// Verifies that <see cref="PasswordHelper.Verify"/> correctly rejects incorrect passwords.
    /// </summary>
    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        // Arrange
        string hash = PasswordHelper.Hash("CorrectPassword123!");

        // Act
        bool result = PasswordHelper.Verify("WrongPassword999!", hash);

        // Assert
        result.Should().BeFalse();
    }

    /// <summary>
    /// Verifies that password verification is case-sensitive.
    /// </summary>
    [Fact]
    public void Verify_WrongCase_ReturnsFalse()
    {
        // Arrange
        string hash = PasswordHelper.Hash("Password123!");

        // Act
        bool result = PasswordHelper.Verify("password123!", hash);

        // Assert
        result.Should().BeFalse("password comparison must be case-sensitive for maximum security");
    }

    /// <summary>
    /// Verifies that attempting to hash an invalid (null or empty) password 
    /// results in an appropriate exception.
    /// </summary>
    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Hash_NullOrEmptyPassword_ThrowsException(string? password)
    {
        // Act
        var act = () => PasswordHelper.Hash(password!);

        // Assert
        act.Should().Throw<System.ArgumentException>("you cannot hash a null or empty password");
    }
}
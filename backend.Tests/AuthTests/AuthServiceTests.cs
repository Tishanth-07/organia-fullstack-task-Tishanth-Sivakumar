// =============================================================================
//  AuthServiceTests.cs
//  Place at: backend.Tests/AuthTests/AuthServiceTests.cs
//
//  WHAT IS TESTED: backend/Services/AuthService.cs
//
//  PURPOSE: Unit tests for the Authentication Service.
//  Covers registration, login, email verification, and password reset flows.
// =============================================================================

using Moq;
using backend.DTOs.Auth;
using backend.Entities;
using backend.Services;
using backend.Services.Interfaces;
using backend.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Logging;

namespace backend.Tests.AuthTests;

public class AuthServiceTests
{
    private readonly Mock<IEmailService> _emailMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly JwtHelper _jwtHelper;

    public AuthServiceTests()
    {
        _emailMock = new Mock<IEmailService>();
        _loggerMock = new Mock<ILogger<AuthService>>();
        _jwtHelper = new JwtHelper(TestJwtConfig.Create());
    }

    // ── Registration Tests ───────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_ValidData_CreatesUserAndReturnsSuccess()
    {
        using var db = TestDbFactory.Create();
        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new RegisterDto("John", "Doe", "new@test.com", "StrongPass123!");

        var result = await service.RegisterAsync(dto);

        result.Message.Should().Contain("Account created");
        db.Users.Count().Should().Be(1);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.Email = "duplicate@test.com";
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new RegisterDto("New", "User", "duplicate@test.com", "Pass123!");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(dto));
    }

    [Fact]
    public async Task RegisterAsync_InvalidPassword_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new RegisterDto("Test", "User", "test@test.com", "123");

        await Assert.ThrowsAsync<ArgumentException>(() => service.RegisterAsync(dto));
    }

    // ── Login Tests ──────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.Email = "login@test.com";
        user.PasswordHash = PasswordHelper.Hash("ValidPass123!");
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new LoginDto("login@test.com", "ValidPass123!");

        var result = await service.LoginAsync(dto);

        result.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be("login@test.com");
    }

    [Fact]
    public async Task LoginAsync_UnverifiedEmail_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.IsEmailVerified = false;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new LoginDto(user.Email, "ValidPass123!");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.LoginAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new LoginDto(user.Email, "WrongPassword123!");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new LoginDto("nonexistent@test.com", "Pass123!");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(dto));
    }

    // ── Verification Tests ───────────────────────────────────────────────────

    [Fact]
    public async Task VerifyEmailAsync_ValidCode_Success()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.Email = "verify@test.com";
        user.EmailVerificationCodeHash = OtpHelper.Hash("123456");
        user.EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new VerifyEmailDto("verify@test.com", "123456");

        var result = await service.VerifyEmailAsync(dto);

        result.Message.Should().Contain("verified successfully");
        user.IsEmailVerified.Should().BeTrue();
    }

    [Fact]
    public async Task VerifyEmailAsync_WrongCode_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.EmailVerificationCodeHash = OtpHelper.Hash("123456");
        user.EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(10);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new VerifyEmailDto(user.Email, "000000");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.VerifyEmailAsync(dto));
    }

    // ── Password Reset Tests ─────────────────────────────────────────────────

    [Fact]
    public async Task ForgotPasswordAsync_ValidEmail_Success()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new ForgotPasswordDto(user.Email);

        var result = await service.ForgotPasswordAsync(dto);

        result.Message.Should().Contain("reset code has been sent");
        _emailMock.Verify(x => x.SendPasswordResetCodeAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidData_Success()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.PasswordResetCodeHash = OtpHelper.Hash("654321");
        user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(10);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new ResetPasswordDto(user.Email, "654321", "NewStrongPass123!");

        var result = await service.ResetPasswordAsync(dto);

        result.Message.Should().Contain("successfully");
        PasswordHelper.Verify("NewStrongPass123!", user.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task ResetPasswordAsync_InvalidCode_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.PasswordResetCodeHash = OtpHelper.Hash("654321");
        user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(10);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new ResetPasswordDto(user.Email, "000000", "Pass123!");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ResetPasswordAsync(dto));
    }

    // ── Account Lockout Tests ────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_AccountLockedOut_ThrowsException()
    {
        using var db = TestDbFactory.Create();
        var user = SampleData.ValidUser();
        user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new AuthService(db, _emailMock.Object, _jwtHelper, _loggerMock.Object);
        var dto = new LoginDto(user.Email, "Pass123!");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.LoginAsync(dto));
    }
}
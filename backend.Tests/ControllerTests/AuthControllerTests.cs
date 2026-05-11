// =============================================================================
//  AuthControllerTests.cs
//  Place at: backend.Tests/ControllerTests/AuthControllerTests.cs
//
//  WHAT IS TESTED: backend/Controllers/AuthController.cs
//
//  PURPOSE: Integration tests for the Authentication API.
//  Uses a real HttpClient and an in-memory database to verify 
//  HTTP status codes and JSON response structures.
// =============================================================================

using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using backend.Data;
using backend.DTOs.Auth;
using backend.Helpers;
using backend.Services.Interfaces;
using Moq;
using FluentAssertions;

namespace backend.Tests.ControllerTests;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // 1. Replace Database
                var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (dbDescriptor != null) services.Remove(dbDescriptor);
                services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase("IntegrationTestDb_Auth"));

                // 2. Mock Email Service (to prevent SMTP errors)
                var emailDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IEmailService));
                if (emailDescriptor != null) services.Remove(emailDescriptor);
                services.AddSingleton(new Mock<IEmailService>().Object);
            });
        });
    }

    [Fact]
    public async Task Register_ValidUser_Returns200()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            firstName = "Alice",
            lastName  = "Controller",
            email     = "alice@controller.com",
            password  = "StrongPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<MessageResponseDto>();
        body!.Message.Should().Contain("Account created");
    }

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var email = "login_test@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var user = SampleData.ValidUser();
        user.Email = email;
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email    = email,
            password = "ValidPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        body!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_UnverifiedEmail_Returns400()
    {
        var email = "unverified@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = SampleData.ValidUser();
        user.Email = email;
        user.IsEmailVerified = false;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email    = email,
            password = "ValidPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email = "wrongpass@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = SampleData.ValidUser();
        user.Email = email;
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email    = email,
            password = "IncorrectPassword123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ForgotPassword_ExistingUser_Returns200()
    {
        var email = "forgot@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = SampleData.ValidUser();
        user.Email = email;
        user.IsEmailVerified = true;
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ForgotPassword_Cooldown_Returns429()
    {
        var email = "cooldown@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = SampleData.ValidUser();
        user.Email = email;
        user.IsEmailVerified = true;
        user.LastVerificationCodeSentAt = DateTime.UtcNow.AddSeconds(-30); // 30s ago
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email });

        response.StatusCode.Should().Be((HttpStatusCode)429);
        var body = await response.Content.ReadFromJsonAsync<MessageResponseDto>();
        body!.Message.Should().Contain("wait");
    }

    [Fact]
    public async Task ResetPassword_InvalidCode_Returns401()
    {
        var email = "reset_fail@controller.com";
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = SampleData.ValidUser();
        user.Email = email;
        user.PasswordResetCodeHash = OtpHelper.Hash("654321");
        user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(10);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/reset-password", new
        {
            email,
            code = "wrong",
            newPassword = "NewPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
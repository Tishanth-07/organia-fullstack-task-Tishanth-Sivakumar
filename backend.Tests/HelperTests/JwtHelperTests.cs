// =============================================================================
//  JwtHelperTests.cs
//  Place at: backend.Tests/HelperTests/JwtHelperTests.cs
//
//  WHAT IS TESTED: backend/Helpers/JwtHelper.cs
//
//  PURPOSE: These tests verify that the JWT token generation logic correctly
//  encodes user claims (Subject, Email, Role) and respects security settings
//  like expiration and issuer validation.
// =============================================================================

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Helpers;
using backend.Entities;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;

namespace backend.Tests.HelperTests;

/// <summary>
/// Unit tests for the <see cref="JwtHelper"/> class.
/// </summary>
public class JwtHelperTests
{
    private readonly JwtSettings _settings = new()
    {
        Key           = "test_super_secret_key_that_is_long_enough_32chars",
        Issuer        = "organia-test",
        Audience      = "organia-test",
        ExpiryMinutes = 60
    };

    private JwtHelper CreateHelper()
    {
        var mockOptions = new Mock<IOptions<JwtSettings>>();
        mockOptions.Setup(o => o.Value).Returns(_settings);
        return new JwtHelper(mockOptions.Object);
    }

    /// <summary>
    /// Verifies that a token is actually generated and is not just an empty string.
    /// </summary>
    [Fact]
    public void GenerateToken_ValidInput_ReturnsNonEmptyString()
    {
        var helper = CreateHelper();
        var user = SampleData.ValidUser();

        string token = helper.GenerateToken(user);

        token.Should().NotBeNullOrWhiteSpace();
    }

    /// <summary>
    /// Verifies that the returned string follows the standard JWT format (three parts separated by dots).
    /// </summary>
    [Fact]
    public void GenerateToken_ProducesValidJwtFormat()
    {
        var helper = CreateHelper();
        var user = SampleData.ValidUser();

        string token = helper.GenerateToken(user);

        token.Split('.').Should().HaveCount(3);
    }

    /// <summary>
    /// Verifies that the 'sub' (Subject) claim in the JWT matches the User's ID.
    /// </summary>
    [Fact]
    public void GenerateToken_ContainsCorrectUserId()
    {
        var helper = CreateHelper();
        var userId = Guid.NewGuid();
        var user = SampleData.ValidUser(id: userId);

        string token = helper.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var decoded = handler.ReadJwtToken(token);

        var userIdClaim = decoded.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
        userIdClaim.Should().NotBeNull();
        userIdClaim!.Value.Should().Be(userId.ToString());
    }

    /// <summary>
    /// Verifies that the 'email' claim in the JWT matches the User's email.
    /// </summary>
    [Fact]
    public void GenerateToken_ContainsCorrectEmail()
    {
        var helper = CreateHelper();
        var user = SampleData.ValidUser();
        user.Email = "specific@test.com";

        string token = helper.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var decoded = handler.ReadJwtToken(token);

        decoded.Claims.Should().Contain(c => c.Value == "specific@test.com");
    }

    /// <summary>
    /// Verifies that the generated token has an expiration date set in the future.
    /// </summary>
    [Fact]
    public void GenerateToken_ExpiryIsInFuture()
    {
        var helper = CreateHelper();
        var user = SampleData.ValidUser();

        string token = helper.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var decoded = handler.ReadJwtToken(token);

        decoded.ValidTo.Should().BeAfter(DateTime.UtcNow);
    }

    /// <summary>
    /// Verifies that the 'role' claim in the JWT matches the User's role.
    /// </summary>
    [Fact]
    public void GenerateToken_ContainsCorrectRole()
    {
        var helper = CreateHelper();
        var user = SampleData.ValidUser();
        user.Role = UserRole.Admin;

        string token = helper.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var decoded = handler.ReadJwtToken(token);

        decoded.Claims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == "Admin");
    }
}
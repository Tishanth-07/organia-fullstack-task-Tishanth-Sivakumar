using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Entities;
using Microsoft.IdentityModel.Tokens;

namespace backend.Helpers;

/// <summary>
/// Helper class for generating JSON Web Tokens (JWT) for authenticated users.
/// </summary>
public class JwtHelper
{
    private readonly IConfiguration _config;

    public JwtHelper(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// Generates a signed JWT token containing user identity and role claims.
    /// </summary>
    /// <param name="user">The user entity to generate the token for.</param>
    /// <returns>A string representing the encoded JWT token.</returns>
    public string GenerateToken(User user)
    {
        // 1. Extract configuration with fallback support for different environments
        var secret    = _config["Jwt:Key"]      ?? _config["JwtSettings:Secret"] ?? "dev_super_secret_key_change_in_prod_32chars";
        var issuer    = _config["Jwt:Issuer"]   ?? _config["JwtSettings:Issuer"]   ?? "organia-local";
        var audience  = _config["Jwt:Audience"] ?? _config["JwtSettings:Audience"] ?? "organia-local";
        var expiryStr = _config["Jwt:ExpiryMinutes"] ?? "60";
        
        if (!int.TryParse(expiryStr, out var expiryMinutes))
        {
            expiryMinutes = 60;
        }

        // 2. Setup Security Key and Signing Credentials
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 3. Define Token Claims (Standard JWT registered claims)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,       user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email,     user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new Claim(JwtRegisteredClaimNames.FamilyName,user.LastName),
            new Claim(ClaimTypes.Role,                   user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti,       Guid.NewGuid().ToString()), // Unique token ID
        };

        // 4. Construct the Security Token
        var token = new JwtSecurityToken(
            issuer:   issuer,
            audience: audience,
            claims:   claims,
            expires:  DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        // 5. Encode and return the token string
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
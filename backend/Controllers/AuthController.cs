using backend.DTOs.Auth;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// Controller for managing all authentication-related API endpoints.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>
    /// Registers a new user account and triggers an email verification code.
    /// </summary>
    /// <param name="dto">User registration details.</param>
    [HttpPost("register")]
    [ProducesResponseType(typeof(MessageResponseDto), 200)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Verifies a user's email address using a 6-digit OTP code.
    /// </summary>
    /// <param name="dto">Email and verification code.</param>
    [HttpPost("verify-email")]
    [ProducesResponseType(typeof(MessageResponseDto), 200)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
    {
        var result = await _auth.VerifyEmailAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Resends the email verification code (subject to a 60-second cooldown).
    /// </summary>
    [HttpPost("resend-verification")]
    [ProducesResponseType(typeof(MessageResponseDto), 200)]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
        var result = await _auth.ResendVerificationCodeAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token on success.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Initiates the password recovery flow by sending an OTP code via email.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(typeof(MessageResponseDto), 200)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await _auth.ForgotPasswordAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Resets a user's password using the OTP code received via email.
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(typeof(MessageResponseDto), 200)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _auth.ResetPasswordAsync(dto);
        return Ok(result);
    }
}
using System.Net;
using System.Text.Json;

namespace backend.Middleware;

/// <summary>
/// Middleware to intercept all unhandled exceptions and return a standardized JSON error response.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during the request.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        // Map exception types to HTTP status codes
        var statusCode = exception switch
        {
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException        => (int)HttpStatusCode.NotFound,
            InvalidOperationException   => (int)HttpStatusCode.BadRequest,
            ArgumentException           => (int)HttpStatusCode.BadRequest,
            _                           => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        // Create a professional error response
        var response = new
        {
            status  = statusCode,
            message = exception.Message,
            // Only include trace/details in Development environments in a real app
            // For now, we keep it simple for the user.
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
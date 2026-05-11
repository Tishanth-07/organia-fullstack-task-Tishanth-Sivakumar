namespace backend.Exceptions;

/// <summary>
/// Exception thrown when a user exceeds a rate limit or cooldown period.
/// Maps to HTTP 429 Too Many Requests.
/// </summary>
public class TooManyRequestsException : Exception
{
    public TooManyRequestsException(string message) : base(message) { }
}

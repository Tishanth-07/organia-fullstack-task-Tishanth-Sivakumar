namespace backend.Exceptions;

/// <summary>
/// Represents a failure from the configured email provider.
/// </summary>
public class EmailDeliveryException : Exception
{
    public EmailDeliveryException(string message) : base(message) { }

    public EmailDeliveryException(string message, Exception innerException)
        : base(message, innerException) { }
}

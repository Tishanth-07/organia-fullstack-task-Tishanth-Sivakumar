// =============================================================================
//  TestFixtures.cs
//  Place at: backend.Tests/TestFixtures.cs
//
//  PURPOSE: Centralized factory for test dependencies. 
//  Provides in-memory database instances, mock configurations, and 
//  standardized sample data to ensure consistency across all test suites.
// =============================================================================

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using backend.Data;
using backend.Entities;
using backend.Helpers;

namespace backend.Tests;

/// <summary>
/// Factory for creating isolated In-Memory database contexts for testing.
/// </summary>
public static class TestDbFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}

/// <summary>
/// Provides a mock configuration for JWT settings used in unit tests.
/// </summary>
public static class TestJwtConfig
{
    public static IOptions<JwtSettings> Create() =>
        Options.Create(new JwtSettings
        {
            Key    = "test_super_secret_key_that_is_long_enough_32chars",
            Issuer = "organia-test",
            Audience = "organia-test",
            ExpiryMinutes = 60
        });
}

/// <summary>
/// Provides standardized data generators for consistent test state.
/// </summary>
public static class SampleData
{
    /// <summary>
    /// Creates a valid User entity with default test properties.
    /// </summary>
    public static User ValidUser(Guid? id = null) => new()
    {
        Id           = id ?? Guid.NewGuid(),
        Email        = $"user-{Guid.NewGuid()}@test.com",
        FirstName    = "Test",
        LastName     = "User",
        PasswordHash = PasswordHelper.Hash("ValidPass123!"),
        CreatedAt    = DateTime.UtcNow
    };

    /// <summary>
    /// Creates a valid TaskItem entity with default test properties.
    /// </summary>
    public static TaskItem ValidTask(Guid? id = null, Guid? userId = null) => new()
    {
        Id          = id ?? Guid.NewGuid(),
        Title       = "Sample Task",
        Description = "A test task description",
        Status      = backend.Entities.TaskStatus.ToDo,
        DueDate     = DateTime.UtcNow.AddDays(7),
        UserId      = userId ?? Guid.NewGuid(),
        CreatedAt   = DateTime.UtcNow
    };
}
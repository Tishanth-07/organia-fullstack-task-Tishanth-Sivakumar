using backend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace backend.Data;

/// <summary>
/// The main database context for the application, responsible for managing 
/// the connection to PostgreSQL and mapping entities to tables.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // ── Entity Sets ───────────────────────────────────────────────────────────
    
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<TaskItem> Tasks { get; set; } = null!;

    /// <summary>
    /// Configures the model mapping using Fluent API and external configuration classes.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Automatically scan and apply all IEntityTypeConfiguration classes in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Ensure GUIDs are handled correctly for PostgreSQL
        modelBuilder.HasPostgresExtension("uuid-ossp");
    }
}
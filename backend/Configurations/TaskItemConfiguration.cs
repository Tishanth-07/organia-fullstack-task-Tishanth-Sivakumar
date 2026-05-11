using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations;

/// <summary>
/// Fluent API configuration for the TaskItem entity.
/// Defines indices, constraints, and relationships.
/// </summary>
public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks");

        builder.HasKey(t => t.Id);

        // Title is mandatory and capped at 200 chars
        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        // Description is optional but capped for performance
        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        // Enums are stored as strings for cross-platform compatibility
        builder.Property(t => t.Status)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(20);

        // Database-level defaults for timestamps
        builder.Property(t => t.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Establish the relationship: One User has Many Tasks
        builder.HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade); // Delete tasks when user is deleted

        // Add index on UserId for faster queries
        builder.HasIndex(t => t.UserId);
        
        // Add index on Status for filtering performance
        builder.HasIndex(t => t.Status);
    }
}
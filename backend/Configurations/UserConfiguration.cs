using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations;

/// <summary>
/// Fluent API configuration for the User entity to define table structure and constraints.
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Define table name
        builder.ToTable("Users");

        // Primary Key
        builder.HasKey(u => u.Id);

        // Name constraints
        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);

        // Unique index for email to prevent duplicates at the database level
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);
        
        builder.HasIndex(u => u.Email)
            .IsUnique();

        // Security fields
        builder.Property(u => u.PasswordHash)
            .IsRequired();

        // Enum mapping: mapped as string for cross-platform compatibility and readability.
        builder.Property(u => u.Role)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(20);

        // Default values
        builder.Property(u => u.IsEmailVerified)
            .HasDefaultValue(false);

        builder.Property(u => u.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
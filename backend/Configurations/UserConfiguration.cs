using backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash).IsRequired();

        builder.Property(u => u.Role)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(u => u.IsEmailVerified).IsRequired();

        builder.Property(u => u.EmailVerificationCodeHash).IsRequired(false);
        builder.Property(u => u.EmailVerificationCodeExpiry).IsRequired(false);
        builder.Property(u => u.PasswordResetCodeHash).IsRequired(false);
        builder.Property(u => u.PasswordResetCodeExpiry).IsRequired(false);
        builder.Property(u => u.LockoutEnd).IsRequired(false);
        builder.Property(u => u.LastVerificationCodeSentAt).IsRequired(false);

        builder.Ignore(u => u.FullName);
        builder.Ignore(u => u.IsLockedOut);

        builder.HasMany(u => u.Tasks)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
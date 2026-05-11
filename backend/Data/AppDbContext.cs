using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User config
        modelBuilder.Entity<User>(u =>
        {
            u.HasIndex(x => x.Email).IsUnique();
            u.Property(x => x.Email).HasMaxLength(256);
            
            u.Property(x => x.FirstName).HasMaxLength(50).IsRequired();
            u.Property(x => x.LastName).HasMaxLength(50).IsRequired();
            
            u.Property(x => x.Role)
             .HasConversion<string>()
             .HasMaxLength(20);
        });

        // TaskItem config
        modelBuilder.Entity<TaskItem>(t =>
        {
            t.ToTable("Tasks");
            
            t.Property(x => x.Status)
             .HasConversion<string>()
             .HasMaxLength(20);

            t.HasOne(x => x.User)
             .WithMany(u => u.Tasks)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            t.HasIndex(x => new { x.UserId, x.Status });
        });
    }
}
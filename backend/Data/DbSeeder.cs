using backend.Entities;
using backend.Helpers;
using Microsoft.EntityFrameworkCore;
using TaskStatus = backend.Entities.TaskStatus;

namespace backend.Data;

/// <summary>
/// Handles initial data seeding for the application, ensuring a consistent
/// starting state and providing demo credentials.
/// </summary>
public static class DbSeeder
{
    /**
     * Seeds the database with a default demo user if one doesn't exist.
     * This allows immediate platform exploration without manual registration.
     */
    public static async Task SeedAsync(AppDbContext db)
    {
        const string demoEmail = "nintrotishanth@gmail.com";
        
        // 1. Check if the demo user already exists to avoid duplication
        var exists = await db.Users.AnyAsync(u => u.Email == demoEmail);
        if (exists) return;

        // 2. Create the demo account with verified status
        var demoUser = new User
        {
            FirstName       = "Demo",
            LastName        = "User",
            Email           = demoEmail,
            PasswordHash    = PasswordHelper.Hash("Password123!"),
            Role            = UserRole.User,
            IsEmailVerified = true,
            CreatedAt       = DateTime.UtcNow
        };

        db.Users.Add(demoUser);
        
        // 3. Optional: Add a few sample tasks for the demo user
        db.Tasks.AddRange(
            new TaskItem 
            { 
                Title = "Welcome to Nintro! 👋", 
                Description = "This is your first sample task. You can edit, delete, or change its status.",
                Status = TaskStatus.ToDo,
                UserId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(2)
            },
            new TaskItem 
            { 
                Title = "Explore the Dashboard", 
                Description = "Check out the stats bar and filters above to organize your workflow.",
                Status = TaskStatus.InProgress,
                UserId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(5)
            },
            new TaskItem 
            { 
                Title = "Hardened Security Verified", 
                Description = "This account was automatically seeded with BCrypt hashing and JWT protection.",
                Status = TaskStatus.Completed,
                UserId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(-1)
            }
        );

        await db.SaveChangesAsync();
    }
}

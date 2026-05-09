namespace backend.Entities;

// Store as string in DB for readability: "ToDo", "InProgress", "Completed"
public enum TaskStatus
{
    ToDo,
    InProgress,
    Completed
}

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.ToDo;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key — links task to its owner
    public Guid UserId { get; set; }

    // Navigation property — EF Core uses this for joins
    public User User { get; set; } = null!;
}
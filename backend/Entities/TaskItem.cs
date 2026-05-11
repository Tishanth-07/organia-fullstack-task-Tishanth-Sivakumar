using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities;

/// <summary>
/// Defines the lifecycle stages of a task.
/// </summary>
public enum TaskStatus
{
    ToDo,
    InProgress,
    Completed
}

/// <summary>
/// Represents an individual task item owned by a user.
/// </summary>
public class TaskItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // ── Content ──────────────────────────────────────────────────────────────
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    // ── State ────────────────────────────────────────────────────────────────
    
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;

    /// <summary>Optional deadline for the task. Stored in UTC.</summary>
    public DateTime? DueDate { get; set; }

    // ── Metadata ─────────────────────────────────────────────────────────────
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // ── Ownership ────────────────────────────────────────────────────────────
    
    /// <summary>The unique ID of the user who owns this task.</summary>
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
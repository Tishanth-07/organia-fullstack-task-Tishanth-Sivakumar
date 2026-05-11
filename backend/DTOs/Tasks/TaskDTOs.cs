using backend.Entities;
using TaskStatus = backend.Entities.TaskStatus;

namespace backend.DTOs.Tasks;

// ── Request DTOs ──────────────────────────────────────────────

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.ToDo;
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskStatus? Status { get; set; }
    public DateTime? DueDate { get; set; }
}

public class TaskQueryDto
{
    public string? Status { get; set; }
    public string? Search { get; set; }
    public string SortBy { get; set; } = "createdAt";      // createdAt | dueDate | title | status
    public string SortOrder { get; set; } = "desc";         // asc | desc
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// ── Response DTOs ─────────────────────────────────────────────

public class TaskResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsOverdue { get; set; }
}

public class PagedTasksDto
{
    public List<TaskResponseDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }

    // Summary counts
    public int ToDoCount { get; set; }
    public int InProgressCount { get; set; }
    public int CompletedCount { get; set; }
    public int OverdueCount { get; set; }
}
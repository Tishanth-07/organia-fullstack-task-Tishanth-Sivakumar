using backend.Entities;
using TaskStatus = backend.Entities.TaskStatus;

namespace backend.DTOs.Tasks;

/// <summary>Request parameters for querying and filtering tasks.</summary>
public record TaskQueryDto(
    string? Status = null,
    string? Search = null,
    string SortBy = "createdAt",
    string SortOrder = "desc",
    int Page = 1,
    int PageSize = 10
);

/// <summary>Data required to create a new task item.</summary>
public record CreateTaskDto(
    string Title,
    string? Description,
    TaskStatus Status = TaskStatus.ToDo,
    DateTime? DueDate = null
);

/// <summary>Data allowed to be updated on an existing task item.</summary>
public record UpdateTaskDto(
    string? Title = null,
    string? Description = null,
    TaskStatus? Status = null,
    DateTime? DueDate = null
);

/// <summary>Comprehensive response model for a single task item.</summary>
public record TaskResponseDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? DueDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public bool IsOverdue { get; init; }
}

/// <summary>Response model for a paginated list of tasks, including status summaries.</summary>
public record PagedTasksDto
{
    public List<TaskResponseDto> Items { get; init; } = new();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public bool HasNextPage { get; init; }
    public bool HasPreviousPage { get; init; }

    // Summary Analytics
    public int ToDoCount { get; init; }
    public int InProgressCount { get; init; }
    public int CompletedCount { get; init; }
    public int OverdueCount { get; init; }
}
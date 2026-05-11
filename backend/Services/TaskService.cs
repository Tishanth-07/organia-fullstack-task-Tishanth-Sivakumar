using backend.Data;
using backend.DTOs.Tasks;
using backend.Entities;
using TaskStatus = backend.Entities.TaskStatus;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Service responsible for handling task-related operations including 
/// creation, retrieval, updates, and deletion.
/// </summary>
public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Retrieves a paged list of tasks for a specific user with filtering and sorting.
    /// </summary>
    /// <param name="userId">The ID of the user owning the tasks.</param>
    /// <param name="query">Filtering, sorting, and pagination parameters.</param>
    /// <returns>A paged result containing task items and status summaries.</returns>
    public async Task<PagedTasksDto> GetTasksAsync(Guid userId, TaskQueryDto query)
    {
        var q = _db.Tasks.Where(t => t.UserId == userId);

        // 1. Filtering by Status
        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<TaskStatus>(query.Status, true, out var status))
        {
            q = q.Where(t => t.Status == status);
        }

        // 2. Keyword Search
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            q = q.Where(t => t.Title.ToLower().Contains(search) ||
                              (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        // 3. Status Summaries (calculated before pagination)
        var allUserTasks = _db.Tasks.Where(t => t.UserId == userId);
        var now = DateTime.UtcNow;
        
        var toDoCount       = await allUserTasks.CountAsync(t => t.Status == TaskStatus.ToDo);
        var inProgressCount = await allUserTasks.CountAsync(t => t.Status == TaskStatus.InProgress);
        var completedCount  = await allUserTasks.CountAsync(t => t.Status == TaskStatus.Completed);
        var overdueCount    = await allUserTasks.CountAsync(t =>
            t.DueDate.HasValue && t.DueDate.Value < now && t.Status != TaskStatus.Completed);

        // 4. Total Count (after filters, before pagination)
        var totalCount = await q.CountAsync();

        // 5. Sorting Logic
        q = (query.SortBy.ToLower(), query.SortOrder.ToLower()) switch
        {
            ("duedate",   "asc")  => q.OrderBy(t => t.DueDate),
            ("duedate",   _)      => q.OrderByDescending(t => t.DueDate),
            ("title",     "asc")  => q.OrderBy(t => t.Title),
            ("title",     _)      => q.OrderByDescending(t => t.Title),
            ("status",    "asc")  => q.OrderBy(t => t.Status),
            ("status",    _)      => q.OrderByDescending(t => t.Status),
            ("updatedat", "asc")  => q.OrderBy(t => t.UpdatedAt),
            ("updatedat", _)      => q.OrderByDescending(t => t.UpdatedAt),
            _                     => query.SortOrder.ToLower() == "asc"
                                         ? q.OrderBy(t => t.CreatedAt)
                                         : q.OrderByDescending(t => t.CreatedAt),
        };

        // 6. Pagination
        var pageSize   = Math.Clamp(query.PageSize, 1, 50);
        var page       = Math.Max(query.Page, 1);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedTasksDto
        {
            Items           = items.Select(ToDto).ToList(),
            TotalCount      = totalCount,
            Page            = page,
            PageSize        = pageSize,
            TotalPages      = totalPages,
            HasNextPage     = page < totalPages,
            HasPreviousPage = page > 1,
            ToDoCount       = toDoCount,
            InProgressCount = inProgressCount,
            CompletedCount  = completedCount,
            OverdueCount    = overdueCount,
        };
    }

    /// <summary>
    /// Fetches a single task by its ID, ensuring it belongs to the specified user.
    /// </summary>
    public async Task<TaskResponseDto?> GetTaskByIdAsync(Guid userId, Guid taskId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
        return task is null ? null : ToDto(task);
    }

    /// <summary>
    /// Creates a new task for the user.
    /// </summary>
    public async Task<TaskResponseDto> CreateTaskAsync(Guid userId, CreateTaskDto dto)
    {
        var task = new TaskItem
        {
            Title       = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Status      = dto.Status,
            DueDate     = dto.DueDate?.ToUniversalTime(),
            UserId      = userId,
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return ToDto(task);
    }

    /// <summary>
    /// Updates an existing task's properties.
    /// </summary>
    public async Task<TaskResponseDto?> UpdateTaskAsync(Guid userId, Guid taskId, UpdateTaskDto dto)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
        if (task is null) return null;

        if (dto.Title is not null)       task.Title       = dto.Title.Trim();
        if (dto.Description is not null) task.Description = dto.Description.Trim();
        if (dto.Status.HasValue)         task.Status      = dto.Status.Value;
        if (dto.DueDate.HasValue)        task.DueDate     = dto.DueDate.Value.ToUniversalTime();

        task.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToDto(task);
    }

    /// <summary>
    /// Permanently deletes a task.
    /// </summary>
    public async Task<bool> DeleteTaskAsync(Guid userId, Guid taskId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
        if (task is null) return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Helper method to convert a TaskItem entity to a TaskResponseDto.
    /// </summary>
    private static TaskResponseDto ToDto(TaskItem t) => new()
    {
        Id          = t.Id,
        Title       = t.Title,
        Description = t.Description,
        Status      = t.Status.ToString(),
        DueDate     = t.DueDate,
        CreatedAt   = t.CreatedAt,
        UpdatedAt   = t.UpdatedAt,
        IsOverdue   = t.DueDate.HasValue
                      && t.DueDate.Value < DateTime.UtcNow
                      && t.Status != TaskStatus.Completed,
    };
}
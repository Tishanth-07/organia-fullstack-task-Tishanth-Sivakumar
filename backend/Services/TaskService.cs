using backend.Data;
using backend.DTOs.Tasks;
using backend.Entities;
using TaskStatus = backend.Entities.TaskStatus;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db)
    {
        _db = db;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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

    // ── Query ─────────────────────────────────────────────────────────────────

    public async Task<PagedTasksDto> GetTasksAsync(Guid userId, TaskQueryDto query)
    {
        var q = _db.Tasks.Where(t => t.UserId == userId);

        // Filter by status
        if (query.Status.HasValue)
            q = q.Where(t => t.Status == query.Status.Value);

        // Search
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            q = q.Where(t => t.Title.ToLower().Contains(s) ||
                              (t.Description != null && t.Description.ToLower().Contains(s)));
        }

        // Summary counts (before pagination, no status filter)
        var allUserTasks = _db.Tasks.Where(t => t.UserId == userId);
        var now = DateTime.UtcNow;
        var toDoCount       = await allUserTasks.CountAsync(t => t.Status == TaskStatus.ToDo);
        var inProgressCount = await allUserTasks.CountAsync(t => t.Status == TaskStatus.InProgress);
        var completedCount  = await allUserTasks.CountAsync(t => t.Status == TaskStatus.Completed);
        var overdueCount    = await allUserTasks.CountAsync(t =>
            t.DueDate.HasValue && t.DueDate.Value < now && t.Status != TaskStatus.Completed);

        // Total (after filters, before pagination)
        var totalCount = await q.CountAsync();

        // Sort
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

        // Pagination
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

    // ── Get by ID ─────────────────────────────────────────────────────────────

    public async Task<TaskResponseDto?> GetTaskByIdAsync(Guid userId, Guid taskId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
        return task is null ? null : ToDto(task);
    }

    // ── Create ────────────────────────────────────────────────────────────────

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

    // ── Update ────────────────────────────────────────────────────────────────

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

    // ── Delete ────────────────────────────────────────────────────────────────

    public async Task<bool> DeleteTaskAsync(Guid userId, Guid taskId)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
        if (task is null) return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return true;
    }
}
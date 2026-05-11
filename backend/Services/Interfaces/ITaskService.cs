using backend.DTOs.Tasks;

namespace backend.Services.Interfaces;

/// <summary>
/// Contract for task management and CRUD operations.
/// </summary>
public interface ITaskService
{
    /// <summary>Retrieves a paged list of tasks with filters.</summary>
    Task<PagedTasksDto> GetTasksAsync(Guid userId, TaskQueryDto query);

    /// <summary>Retrieves a single task by its ID.</summary>
    Task<TaskResponseDto?> GetTaskByIdAsync(Guid userId, Guid taskId);

    /// <summary>Creates a new task for the user.</summary>
    Task<TaskResponseDto> CreateTaskAsync(Guid userId, CreateTaskDto dto);

    /// <summary>Updates an existing task.</summary>
    Task<TaskResponseDto?> UpdateTaskAsync(Guid userId, Guid taskId, UpdateTaskDto dto);

    /// <summary>Deletes a task by its ID.</summary>
    Task<bool> DeleteTaskAsync(Guid userId, Guid taskId);
}
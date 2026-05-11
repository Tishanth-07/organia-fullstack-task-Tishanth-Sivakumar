using backend.DTOs.Tasks;

namespace backend.Services.Interfaces;

public interface ITaskService
{
    Task<PagedTasksDto> GetTasksAsync(Guid userId, TaskQueryDto query);
    Task<TaskResponseDto?> GetTaskByIdAsync(Guid userId, Guid taskId);
    Task<TaskResponseDto> CreateTaskAsync(Guid userId, CreateTaskDto dto);
    Task<TaskResponseDto?> UpdateTaskAsync(Guid userId, Guid taskId, UpdateTaskDto dto);
    Task<bool> DeleteTaskAsync(Guid userId, Guid taskId);
}
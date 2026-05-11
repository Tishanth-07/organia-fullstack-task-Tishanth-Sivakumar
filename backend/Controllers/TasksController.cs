using backend.DTOs.Tasks;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

/// <summary>
/// Controller for managing user tasks. All endpoints require a valid JWT token.
/// </summary>
[ApiController]
[Route("api/tasks")]
[Authorize] // Enforce authentication for all endpoints in this controller
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Retrieves a paginated list of tasks for the authenticated user.
    /// Supports status filtering, searching, and custom sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedTasksDto), 200)]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryDto query)
    {
        var userId = GetUserIdFromClaims();
        var result = await _taskService.GetTasksAsync(userId, query);
        return Ok(result);
    }

    /// <summary>
    /// Fetches a single task by its unique ID.
    /// </summary>
    /// <param name="id">The GUID of the task.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var userId = GetUserIdFromClaims();
        var task   = await _taskService.GetTaskByIdAsync(userId, id);
        
        if (task == null)
        {
            return NotFound(new { message = "Task not found or access denied." });
        }
        
        return Ok(task);
    }

    /// <summary>
    /// Creates a new task for the authenticated user.
    /// </summary>
    /// <param name="dto">Task creation data.</param>
    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { message = "Task title is required." });
        }

        var userId = GetUserIdFromClaims();
        var task   = await _taskService.CreateTaskAsync(userId, dto);
        
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Updates an existing task's properties.
    /// </summary>
    /// <param name="id">The GUID of the task to update.</param>
    /// <param name="dto">Updated task details.</param>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
    {
        var userId = GetUserIdFromClaims();
        var task   = await _taskService.UpdateTaskAsync(userId, id, dto);
        
        if (task == null)
        {
            return NotFound(new { message = "Task not found or access denied." });
        }
        
        return Ok(task);
    }

    /// <summary>
    /// Permanently deletes a task by its unique ID.
    /// </summary>
    /// <param name="id">The GUID of the task to delete.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId  = GetUserIdFromClaims();
        var deleted = await _taskService.DeleteTaskAsync(userId, id);
        
        if (!deleted)
        {
            return NotFound(new { message = "Task not found or access denied." });
        }
        
        return NoContent();
    }

    /// <summary>
    /// Extracts the User ID from the JWT NameIdentifier claim.
    /// </summary>
    private Guid GetUserIdFromClaims()
    {
        var rawId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("sub")
                 ?? throw new UnauthorizedAccessException("Session expired or invalid. Please log in again.");
        
        return Guid.Parse(rawId);
    }
}
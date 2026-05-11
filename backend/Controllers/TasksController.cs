using backend.DTOs.Tasks;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    // ── Resolve caller's userId from JWT claim ────────────────────────────────
    private Guid GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")
               ?? throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(raw);
    }

    // ── GET /api/tasks ────────────────────────────────────────────────────────
    /// <summary>Get paginated tasks for the current user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedTasksDto), 200)]
    public async Task<IActionResult> GetTasks([FromQuery] TaskQueryDto query)
    {
        var userId = GetUserId();
        var result = await _taskService.GetTasksAsync(userId, query);
        return Ok(result);
    }

    // ── GET /api/tasks/{id} ───────────────────────────────────────────────────
    /// <summary>Get a single task by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var userId = GetUserId();
        var task   = await _taskService.GetTaskByIdAsync(userId, id);
        return task is null ? NotFound(new { message = "Task not found." }) : Ok(task);
    }

    // ── POST /api/tasks ───────────────────────────────────────────────────────
    /// <summary>Create a new task.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Title is required." });

        var userId = GetUserId();
        var task   = await _taskService.CreateTaskAsync(userId, dto);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // ── PUT /api/tasks/{id} ───────────────────────────────────────────────────
    /// <summary>Update an existing task.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetUserId();
        var task   = await _taskService.UpdateTaskAsync(userId, id, dto);
        return task is null ? NotFound(new { message = "Task not found." }) : Ok(task);
    }

    // ── DELETE /api/tasks/{id} ────────────────────────────────────────────────
    /// <summary>Delete a task.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var userId  = GetUserId();
        var deleted = await _taskService.DeleteTaskAsync(userId, id);
        return deleted ? NoContent() : NotFound(new { message = "Task not found." });
    }
}
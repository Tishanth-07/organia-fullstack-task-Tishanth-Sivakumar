// =============================================================================
//  TaskServiceTests.cs
//  Place at: backend.Tests/TaskTests/TaskServiceTests.cs
//
//  WHAT IS TESTED: backend/Services/TaskService.cs
//
//  PURPOSE: Unit tests for the Task management service.
//  Verifies CRUD operations, data isolation between users, 
//  and business logic for search/filter/sort.
// =============================================================================

using backend.DTOs.Tasks;
using backend.Services;
using backend.Entities;
using FluentAssertions;

namespace backend.Tests.TaskTests;

public class TaskServiceTests
{
    // ── Create Tests ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateTaskAsync_ValidData_ReturnsCreatedTask()
    {
        using var db = TestDbFactory.Create();
        var service  = new TaskService(db);
        var userId   = Guid.NewGuid();
        var dto      = new CreateTaskDto("New Task", null, backend.Entities.TaskStatus.ToDo);

        var result = await service.CreateTaskAsync(userId, dto);

        result.Title.Should().Be("New Task");
        db.Tasks.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateTaskAsync_WithDescriptionAndDueDate_StoresCorrectly()
    {
        using var db = TestDbFactory.Create();
        var service  = new TaskService(db);
        var userId   = Guid.NewGuid();
        var dueDate  = DateTime.UtcNow.AddDays(1);
        var dto      = new CreateTaskDto("Task", "Desc", backend.Entities.TaskStatus.ToDo, dueDate);

        var result = await service.CreateTaskAsync(userId, dto);

        result.Description.Should().Be("Desc");
        result.DueDate.Should().BeCloseTo(dueDate, TimeSpan.FromSeconds(1));
    }

    // ── Get All / Query Tests ────────────────────────────────────────────────

    [Fact]
    public async Task GetTasksAsync_FilteringByStatus_ReturnsFilteredTasks()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        db.Tasks.Add(SampleData.ValidTask(null, userId)); // ToDo
        db.Tasks.Add(new TaskItem { Title = "C", Status = backend.Entities.TaskStatus.Completed, UserId = userId });
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result  = await service.GetTasksAsync(userId, new TaskQueryDto(Status: "Completed"));

        result.Items.Should().HaveCount(1);
        result.Items[0].Status.Should().Be("Completed");
    }

    [Fact]
    public async Task GetTasksAsync_SearchingByTitle_ReturnsMatchingTasks()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        db.Tasks.Add(new TaskItem { Title = "Specific", UserId = userId });
        db.Tasks.Add(new TaskItem { Title = "Random", UserId = userId });
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result  = await service.GetTasksAsync(userId, new TaskQueryDto(Search: "Spec"));

        result.Items.Should().HaveCount(1);
        result.Items[0].Title.Should().Be("Specific");
    }

    [Fact]
    public async Task GetTasksAsync_SortingByDueDate_ReturnsSortedTasks()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        db.Tasks.Add(new TaskItem { Title = "Later", DueDate = DateTime.UtcNow.AddDays(10), UserId = userId });
        db.Tasks.Add(new TaskItem { Title = "Sooner", DueDate = DateTime.UtcNow.AddDays(1), UserId = userId });
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result  = await service.GetTasksAsync(userId, new TaskQueryDto(SortBy: "duedate", SortOrder: "asc"));

        result.Items[0].Title.Should().Be("Sooner");
        result.Items[1].Title.Should().Be("Later");
    }

    [Fact]
    public async Task GetTasksAsync_Isolation_OnlyReturnsOwnTasks()
    {
        using var db = TestDbFactory.Create();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();
        db.Tasks.Add(SampleData.ValidTask(null, user1));
        db.Tasks.Add(SampleData.ValidTask(null, user2));
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.GetTasksAsync(user1, new TaskQueryDto());

        result.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetTasksAsync_SummaryCounts_AreCorrect()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        db.Tasks.Add(new TaskItem { Title = "T1", Status = backend.Entities.TaskStatus.ToDo, UserId = userId });
        db.Tasks.Add(new TaskItem { Title = "T2", Status = backend.Entities.TaskStatus.Completed, UserId = userId });
        db.Tasks.Add(new TaskItem { Title = "T3", Status = backend.Entities.TaskStatus.ToDo, DueDate = DateTime.UtcNow.AddDays(-1), UserId = userId });
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.GetTasksAsync(userId, new TaskQueryDto());

        result.ToDoCount.Should().Be(2);
        result.CompletedCount.Should().Be(1);
        result.OverdueCount.Should().Be(1);
    }

    // ── Get By ID Tests ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetTaskByIdAsync_ExistingTask_ReturnsTask()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        var task     = SampleData.ValidTask(null, userId);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result  = await service.GetTaskByIdAsync(userId, task.Id);

        result.Should().NotBeNull();
        result!.Id.Should().Be(task.Id);
    }

    [Fact]
    public async Task GetTaskByIdAsync_NonExistent_ReturnsNull()
    {
        using var db = TestDbFactory.Create();
        var service = new TaskService(db);
        var result = await service.GetTaskByIdAsync(Guid.NewGuid(), Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTaskByIdAsync_OtherUsersTask_ReturnsNull()
    {
        using var db = TestDbFactory.Create();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();
        var task = SampleData.ValidTask(null, user2);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.GetTaskByIdAsync(user1, task.Id);

        result.Should().BeNull();
    }

    // ── Update Tests ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateTaskAsync_ExistingTask_UpdatesFields()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        var task     = SampleData.ValidTask(null, userId);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var dto = new UpdateTaskDto(Title: "Updated", Status: backend.Entities.TaskStatus.Completed);

        var result = await service.UpdateTaskAsync(userId, task.Id, dto);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Updated");
        result.Status.Should().Be("Completed");
    }

    [Fact]
    public async Task UpdateTaskAsync_NonExistent_ReturnsNull()
    {
        using var db = TestDbFactory.Create();
        var service = new TaskService(db);
        var result = await service.UpdateTaskAsync(Guid.NewGuid(), Guid.NewGuid(), new UpdateTaskDto());

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateTaskAsync_PartialUpdate_KeepsOriginalValues()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        var task     = SampleData.ValidTask(null, userId);
        task.Description = "Original Desc";
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var dto = new UpdateTaskDto(Title: "New Title"); // Description not set

        var result = await service.UpdateTaskAsync(userId, task.Id, dto);

        result!.Title.Should().Be("New Title");
        result.Description.Should().Be("Original Desc");
    }

    // ── Delete Tests ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteTaskAsync_ExistingTask_ReturnsTrueAndRemoves()
    {
        using var db = TestDbFactory.Create();
        var userId   = Guid.NewGuid();
        var task     = SampleData.ValidTask(null, userId);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.DeleteTaskAsync(userId, task.Id);

        result.Should().BeTrue();
        db.Tasks.Count().Should().Be(0);
    }

    [Fact]
    public async Task DeleteTaskAsync_NonExistent_ReturnsFalse()
    {
        using var db = TestDbFactory.Create();
        var service = new TaskService(db);
        var result = await service.DeleteTaskAsync(Guid.NewGuid(), Guid.NewGuid());

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTaskAsync_OtherUsersTask_ReturnsFalse()
    {
        using var db = TestDbFactory.Create();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();
        var task = SampleData.ValidTask(null, user2);
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.DeleteTaskAsync(user1, task.Id);

        result.Should().BeFalse();
        db.Tasks.Count().Should().Be(1);
    }

    // ── Paging Tests ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetTasksAsync_Pagination_ReturnsCorrectPage()
    {
        using var db = TestDbFactory.Create();
        var userId = Guid.NewGuid();
        for (int i = 1; i <= 5; i++)
        {
            db.Tasks.Add(new TaskItem { Title = $"Task {i}", UserId = userId, CreatedAt = DateTime.UtcNow.AddMinutes(i) });
        }
        await db.SaveChangesAsync();

        var service = new TaskService(db);
        var result = await service.GetTasksAsync(userId, new TaskQueryDto(Page: 2, PageSize: 2, SortBy: "createdat", SortOrder: "asc"));

        result.Items.Should().HaveCount(2);
        result.Items[0].Title.Should().Be("Task 3");
        result.TotalCount.Should().Be(5);
        result.TotalPages.Should().Be(3);
    }
}
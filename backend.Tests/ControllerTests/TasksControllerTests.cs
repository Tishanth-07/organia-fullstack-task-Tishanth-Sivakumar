// =============================================================================
//  TasksControllerTests.cs
//  Place at: backend.Tests/ControllerTests/TasksControllerTests.cs
//
//  WHAT IS TESTED: backend/Controllers/TasksController.cs
//
//  PURPOSE: Integration tests for the Task management API.
//  Verifies that CRUD operations are protected by JWT authentication, 
//  and that users can only manage their own tasks (Data Isolation).
// =============================================================================

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using backend.Data;
using backend.DTOs.Auth;
using backend.DTOs.Tasks;
using backend.Helpers;
using backend.Services.Interfaces;
using Moq;
using FluentAssertions;

namespace backend.Tests.ControllerTests;

public class TasksControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private static readonly string _dbName = "TasksIntegration_" + Guid.NewGuid();

    public TasksControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                if (dbDescriptor != null) services.Remove(dbDescriptor);
                services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_dbName));

                var emailDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IEmailService));
                if (emailDescriptor != null) services.Remove(emailDescriptor);
                services.AddSingleton(new Mock<IEmailService>().Object);
            });
        });
    }

    private async Task<string> GetTokenAsync(HttpClient client, string email = "user@test.com")
    {
        email = email.ToLower();
        var password = "ValidPass123!";

        // 1. Try to Login first
        var loginResp = await client.PostAsJsonAsync("/api/auth/login", new LoginDto(email, password));
        
        if (loginResp.StatusCode == HttpStatusCode.OK)
        {
            var body = await loginResp.Content.ReadFromJsonAsync<AuthResponseDto>();
            return body!.Token;
        }

        // 2. If login fails (user doesn't exist), register
        var regResp = await client.PostAsJsonAsync("/api/auth/register", new RegisterDto("John", "Doe", email, password));
        
        if (regResp.StatusCode != HttpStatusCode.OK)
        {
            var err = await regResp.Content.ReadAsStringAsync();
            throw new Exception($"Registration failed: {regResp.StatusCode} - {err}");
        }

        // 3. Bypass verification
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            user.IsEmailVerified = true;
            await db.SaveChangesAsync();
        }

        // 4. Login again
        loginResp = await client.PostAsJsonAsync("/api/auth/login", new LoginDto(email, password));
        if (loginResp.StatusCode != HttpStatusCode.OK)
        {
            var err = await loginResp.Content.ReadAsStringAsync();
            throw new Exception($"Login failed after registration: {loginResp.StatusCode} - {err}");
        }

        var finalBody = await loginResp.Content.ReadFromJsonAsync<AuthResponseDto>();
        return finalBody!.Token;
    }

    private async Task<HttpClient> GetAuthenticatedClientAsync(string email = "user@test.com")
    {
        var client = _factory.CreateClient();
        var token  = await GetTokenAsync(client, email);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task GetTasks_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/tasks");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateTask_ValidData_Returns201WithTask()
    {
        var client  = await GetAuthenticatedClientAsync("create@test.com");
        var payload = new CreateTaskDto("Integration Task", null, backend.Entities.TaskStatus.ToDo);

        var response = await client.PostAsJsonAsync("/api/tasks", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        body!.Title.Should().Be("Integration Task");
    }

    [Fact]
    public async Task CreateTask_EmptyTitle_Returns400()
    {
        var client = await GetAuthenticatedClientAsync("bad_data@test.com");
        var payload = new CreateTaskDto("", null, backend.Entities.TaskStatus.ToDo);

        var response = await client.PostAsJsonAsync("/api/tasks", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateTask_OwnTask_Returns200()
    {
        var client  = await GetAuthenticatedClientAsync("update_own@test.com");
        var createdResp = await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Orig", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var response = await client.PutAsJsonAsync($"/api/tasks/{createdTask!.Id}", new UpdateTaskDto(Title: "Updated"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        updated!.Title.Should().Be("Updated");
    }

    [Fact]
    public async Task UpdateTask_OtherUsersTask_Returns404()
    {
        var client1 = await GetAuthenticatedClientAsync("user1@test.com");
        var createdResp = await client1.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Secret", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var client2 = await GetAuthenticatedClientAsync("user2@test.com");
        var response = await client2.PutAsJsonAsync($"/api/tasks/{createdTask!.Id}", new UpdateTaskDto(Title: "Hack"));

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTask_OwnTask_Returns204()
    {
        var client = await GetAuthenticatedClientAsync("delete_own@test.com");
        var createdResp = await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Gone", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var response = await client.DeleteAsync($"/api/tasks/{createdTask!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteTask_OtherUsersTask_Returns404()
    {
        var client1 = await GetAuthenticatedClientAsync("victim@test.com");
        var createdResp = await client1.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Protected", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var client2 = await GetAuthenticatedClientAsync("attacker@test.com");
        var response = await client2.DeleteAsync($"/api/tasks/{createdTask!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTaskById_OwnTask_Returns200()
    {
        var client = await GetAuthenticatedClientAsync("get_one@test.com");
        var createdResp = await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Target", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var response = await client.GetAsync($"/api/tasks/{createdTask!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var fetched = await response.Content.ReadFromJsonAsync<TaskResponseDto>();
        fetched!.Title.Should().Be("Target");
    }

    [Fact]
    public async Task GetTaskById_OtherUsersTask_Returns404()
    {
        var client1 = await GetAuthenticatedClientAsync("owner@test.com");
        var createdResp = await client1.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Private", null, backend.Entities.TaskStatus.ToDo));
        var createdTask = await createdResp.Content.ReadFromJsonAsync<TaskResponseDto>();

        var client2 = await GetAuthenticatedClientAsync("stranger@test.com");
        var response = await client2.GetAsync($"/api/tasks/{createdTask!.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTasks_WithSearch_ReturnsFiltered200()
    {
        var client = await GetAuthenticatedClientAsync("searcher@test.com");
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Find Me", null, backend.Entities.TaskStatus.ToDo));
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("Ignore Me", null, backend.Entities.TaskStatus.ToDo));

        var response = await client.GetAsync("/api/tasks?search=Find");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<PagedTasksDto>();
        body!.Items.Should().HaveCount(1);
        body.Items[0].Title.Should().Be("Find Me");
    }

    [Fact]
    public async Task GetTasks_WithStatusFilter_ReturnsFiltered200()
    {
        var client = await GetAuthenticatedClientAsync("filterer@test.com");
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("T1", null, backend.Entities.TaskStatus.ToDo));
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("T2", null, backend.Entities.TaskStatus.InProgress));

        var response = await client.GetAsync("/api/tasks?status=InProgress");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<PagedTasksDto>();
        body!.Items.Should().HaveCount(1);
        body.Items[0].Status.Should().Be("InProgress");
    }

    [Fact]
    public async Task GetTasks_WithSort_ReturnsSorted200()
    {
        var client = await GetAuthenticatedClientAsync("sorter@test.com");
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("B Task", null, backend.Entities.TaskStatus.ToDo));
        await client.PostAsJsonAsync("/api/tasks", new CreateTaskDto("A Task", null, backend.Entities.TaskStatus.ToDo));

        var response = await client.GetAsync("/api/tasks?sortBy=title&sortOrder=asc");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<PagedTasksDto>();
        body!.Items[0].Title.Should().Be("A Task");
        body.Items[1].Title.Should().Be("B Task");
    }
}
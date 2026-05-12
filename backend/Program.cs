using System.Text;
using backend.Data;
using backend.Helpers;
using backend.Middleware;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// ── Database Configuration ───────────────────────────────────────────────────
// Configure PostgreSQL connection using the "DefaultConnection" string from appsettings or environment
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT Authentication ────────────────────────────────────────────────────────
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
var jwtKey = !string.IsNullOrWhiteSpace(jwtSettings.Key) ? jwtSettings.Key : "dev_super_secret_key_change_in_prod_32chars";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"] ?? "organia-local",
            ValidAudience            = builder.Configuration["Jwt:Audience"] ?? "organia-local",
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero // Strict expiry check
        };
    });

builder.Services.AddAuthorization();

// ── Email Configuration ──────────────────────────────────────────────────────
// Uses Mailjet HTTP API — bypasses Render SMTP blocks
builder.Services.AddHttpClient<IEmailService, EmailService>();

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<ITaskService, TaskService>();

// ── Controller & JSON Configuration ──────────────────────────────────────────
// Configure controllers and ensure enums are serialized as strings for the frontend
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

// ── Swagger / API Documentation ──────────────────────────────────────────────
// Configure Swagger with JWT Authorization support for local testing
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Nintro Task API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header. Example: 'Bearer {token}'",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// ── CORS Policy ───────────────────────────────────────────────────────────────
// Allow local development origin and production placeholders
builder.Services.AddCors(options =>
{
    var origins = (builder.Configuration["ALLOWED_ORIGINS"] ?? builder.Configuration["AllowedOrigins"])?.Split(',') 
               ?? new[] { "http://localhost:3000" };

    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Build Application ─────────────────────────────────────────────────────────
var app = builder.Build();

// Enable Global Exception Middleware as the first line of defense
app.UseMiddleware<GlobalExceptionMiddleware>();

// Always enable Swagger for the interview task evaluation
app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
    // Local development specific middleware can go here
    app.UseHttpsRedirection();
}
app.UseCors("AllowFrontend");
app.UseAuthentication(); 
app.UseAuthorization();

// ── Health Check ──────────────────────────────────────────────────────────────
// Lightweight endpoint to monitor API health status
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    version = "1.0.0" 
}));

// ── Auto-Migrations ───────────────────────────────────────────────────────────
// Apply pending migrations on startup to keep database schema in sync
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("AutoMigrate"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try 
    {
        db.Database.Migrate();
        // Seed demo data for immediate platform exploration
        DbSeeder.SeedAsync(db).GetAwaiter().GetResult();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database migration failed on startup.");
    }
}

app.MapControllers();

app.Run();

// Make Program class accessible to integration tests
public partial class Program { }
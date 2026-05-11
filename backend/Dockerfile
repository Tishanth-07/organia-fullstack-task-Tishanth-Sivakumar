# ── Build Stage ───────────────────────────────────────────────────────────────
# Use the .NET 8 SDK image for compiling the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy project files and restore dependencies (cached unless changed)
COPY backend/backend.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

# 2. Copy the full source
COPY . .

# ── Test Stage ────────────────────────────────────────────────────────────────
FROM build AS test
WORKDIR /src
# Run all tests before publishing
RUN dotnet test ./backend.Tests/backend.Tests.csproj --verbosity normal

# ── Publish Stage ─────────────────────────────────────────────────────────────
FROM test AS publish
WORKDIR /src/backend
RUN dotnet publish backend.csproj -c Release -o /app/publish --no-restore

# ── Runtime Stage ─────────────────────────────────────────────────────────────
# Use the lightweight ASP.NET runtime image for the final container
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Security: Create a non-root user to run the application
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Copy the compiled binaries from the build stage
COPY --from=publish /app/publish .

# The application listens on port 5181 (as configured in Program.cs/docker-compose)
EXPOSE 5181

ENTRYPOINT ["dotnet", "backend.dll"]
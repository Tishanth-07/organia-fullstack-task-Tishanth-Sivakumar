FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY backend/backend.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

# Copy everything else and build
COPY . .
WORKDIR /src/backend
RUN dotnet publish backend.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5181
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5181

ENTRYPOINT ["dotnet", "backend.dll"]
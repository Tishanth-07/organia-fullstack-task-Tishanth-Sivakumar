<div align="center">
  <h1>Nintro Task Management System</h1>
  <p><strong>A production-ready full-stack task management platform with secure auth, OTP email verification, and a polished dashboard experience.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8" />
    <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon" />
    <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=000000" alt="Render" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## Overview

Nintro is a full-stack task management system built for a modern assessment-grade production workflow. Users can register, verify their email with a short-lived OTP code, log in securely, and manage personal tasks through a fast, responsive dashboard.

The project is intentionally practical: a Next.js frontend on Vercel, a .NET 8 API on Render, PostgreSQL on Neon, and email delivery through a Google Apps Script HTTPS webhook to avoid SMTP restrictions on hosted platforms.

## Live Deployment

| Service | Platform | URL |
| :--- | :--- | :--- |
| Frontend | Vercel | [https://organia-fullstack-task-frontend.vercel.app](https://organia-fullstack-task-frontend.vercel.app) |
| Backend API | Render | [https://organia-fullstack-task-backend-api.onrender.com](https://organia-fullstack-task-backend-api.onrender.com) |
| API Docs | Render Swagger | [https://organia-fullstack-task-backend-api.onrender.com/swagger](https://organia-fullstack-task-backend-api.onrender.com/swagger) |
| Database | Neon PostgreSQL | Managed cloud Postgres |

## Demo Login

The backend seeds a verified demo account when the database is empty:

```text
Email:    nintrotishanth@gmail.com
Password: Password123!
```

## Features

- Secure registration, login, email verification, password reset, and account lockout
- JWT authentication with protected task routes
- BCrypt password hashing
- OTP codes for email verification and password recovery
- Task CRUD with status, due date, filtering, sorting, and pagination
- Responsive Next.js dashboard built with TypeScript, Tailwind CSS, Zustand, and React Hook Form
- Swagger documentation for backend API exploration
- Docker Compose setup for local full-stack development
- Automated backend and frontend test coverage

## Architecture

```text
User Browser
    |
    | HTTPS
    v
Vercel - Next.js Frontend
    |
    | NEXT_PUBLIC_API_URL
    v
Render - .NET 8 Web API
    |
    | Npgsql / EF Core
    v
Neon - PostgreSQL

Render API
    |
    | HTTPS webhook
    v
Google Apps Script - Gmail Email Delivery
```

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, Zustand, Zod, React Hook Form |
| Backend | .NET 8, ASP.NET Core Web API, Entity Framework Core, JWT Bearer Auth |
| Database | PostgreSQL locally, Neon PostgreSQL in production |
| Email | Google Apps Script Web App using Gmail `MailApp` over HTTPS |
| Deployment | Vercel frontend, Render backend, Neon database |
| Local Dev | Docker Compose |
| Testing | xUnit, FluentAssertions, Moq, Jest |

## Local Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A Google Apps Script web app URL for email delivery

### Environment

Create a root `.env` file:

```env
# Database
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_local_password
POSTGRES_DB=organia_tasks_dev

# JWT
JWT_KEY=your_very_long_secret_key_at_least_32_characters
JWT_ISSUER=organia-local
JWT_AUDIENCE=organia-local

# Backend
BACKEND_PORT=5181
ASPNETCORE_ENVIRONMENT=Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5181
AUTO_MIGRATE=true

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5181/api

# Email webhook
GOOGLE_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_WEBHOOK_SECRET=
FROM_EMAIL=your-gmail-address@gmail.com
FROM_NAME=Nintro
```

### Run With Docker

```bash
docker compose up --build
```

Local URLs:

| Service | URL |
| :--- | :--- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:5181](http://localhost:5181) |
| Swagger | [http://localhost:5181/swagger](http://localhost:5181/swagger) |

## Email Webhook Setup

The backend sends verification and reset emails through a Google Apps Script web app. This avoids SMTP ports and works over HTTPS on Render.

1. Open [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. Paste the script from [`docs/google-email-webhook.gs`](docs/google-email-webhook.gs).
4. Deploy as a **Web app**.
5. Set **Execute as** to `Me`.
6. Set **Who has access** to `Anyone`.
7. Copy the `/exec` deployment URL into `GOOGLE_WEBHOOK_URL`.

Optional shared secret:

- Leave `GOOGLE_WEBHOOK_SECRET` empty for the simplest setup.
- Or set a random value in `.env` and add the same value to Apps Script project properties as `EMAIL_WEBHOOK_SECRET`.

## Production Deployment

### Database - Neon

Create a Neon PostgreSQL database and copy the pooled connection string.

Render expects the connection string in this format:

```env
ConnectionStrings__DefaultConnection=Host=YOUR_NEON_HOST;Database=YOUR_DB;Username=YOUR_USER;Password=YOUR_PASSWORD;SSL Mode=VerifyFull;Channel Binding=Require;
```

### Backend - Render

Render service environment variables:

```env
ASPNETCORE_ENVIRONMENT=Production
AutoMigrate=true
ALLOWED_ORIGINS=https://organia-fullstack-task-frontend.vercel.app

ConnectionStrings__DefaultConnection=Host=YOUR_NEON_HOST;Database=YOUR_DB;Username=YOUR_USER;Password=YOUR_PASSWORD;SSL Mode=VerifyFull;Channel Binding=Require;

Jwt__Key=your_very_long_production_jwt_secret
Jwt__Issuer=organia-local
Jwt__Audience=organia-local

EmailSettings__GoogleWebhookUrl=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
EmailSettings__GoogleWebhookSecret=
EmailSettings__FromEmail=your-gmail-address@gmail.com
EmailSettings__FromName=Nintro
```

Remove old SMTP, Mailjet, or Resend variables if they exist. The final email provider is the Google webhook.

### Frontend - Vercel

Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://organia-fullstack-task-backend-api.onrender.com/api
```

Deploy the `frontend` app on Vercel. The backend CORS setting must include the final Vercel domain.

## API Endpoints

Base path:

```text
/api
```

### Authentication

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/register` | Create account and send verification OTP | No |
| `POST` | `/auth/verify-email` | Verify account email with OTP | No |
| `POST` | `/auth/resend-verification` | Resend verification OTP | No |
| `POST` | `/auth/login` | Login and receive JWT | No |
| `POST` | `/auth/forgot-password` | Send password reset OTP | No |
| `POST` | `/auth/reset-password` | Reset password using OTP | No |

### Tasks

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/tasks` | List tasks with filtering, sorting, and pagination | Yes |
| `POST` | `/tasks` | Create a task | Yes |
| `GET` | `/tasks/{id}` | Get one task | Yes |
| `PUT` | `/tasks/{id}` | Update a task | Yes |
| `DELETE` | `/tasks/{id}` | Delete a task | Yes |

## Testing

Backend:

```bash
dotnet test backend.Tests/backend.Tests.csproj
```

Frontend:

```bash
cd frontend
npm test
```

## Repository Structure

```text
backend/         ASP.NET Core API, EF Core, auth, tasks, email service
backend.Tests/   xUnit integration and service tests
frontend/        Next.js application
docs/            Google Apps Script email webhook
docker-compose.yml
.env.example
```

## Security Notes

- Never commit `.env`.
- Rotate any keys that were pasted into logs, screenshots, or chats.
- Use a strong production `Jwt__Key`.
- Keep the Google Apps Script deployment URL private.
- Use `GOOGLE_WEBHOOK_SECRET` for an extra layer of protection if the webhook URL is shared beyond the deployment environment.

---

<div align="center">
  <p><strong>Built by Tishanth Sivakumar</strong></p>
  <p>Nintro - engineered as a clean, deployable full-stack assessment project.</p>
</div>

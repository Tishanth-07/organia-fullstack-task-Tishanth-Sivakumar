<div align="center">
  <h1>✨ Nintro</h1>
  <p><strong>The modern task management system for high-performing teams.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8" />
    <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<br/>

Nintro is a high-performance, full-stack task management platform designed for modern teams. It provides a seamless, beautiful interface for planning, tracking, and shipping work with near-zero latency and robust data integrity.

## 🌟 Project Overview

Nintro bridges the gap between complex project management tools and simple to-do lists. It offers a secure, JWT-authenticated environment where users can manage their tasks through a highly responsive dashboard, complete with real-time status updates, advanced filtering, and email verification workflows.

---

## 💻 Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | .NET 8 (C#) | Robust API with Entity Framework Core and PostgreSQL 16. |
| **Frontend** | Next.js 14 | App Router, TypeScript, Tailwind CSS, and Zustand. |
| **Auth** | JWT & BCrypt | Secure HTTP-only cookies, role management, and OTP verification. |
| **Infra** | Docker | Fully containerized environment using `docker-compose`. |
| **Testing** | xUnit & Jest | 100% test pass rate across API integrations and UI components. |

---

## 🚀 Live URLs

Check out the live deployments of the Nintro platform:

- 🌍 **Frontend Application**: [https://nintro-app.vercel.app](https://nintro-app.vercel.app) *(Placeholder)*
- ⚙️ **Backend API**: [https://nintro-api.onrender.com](https://nintro-api.onrender.com) *(Placeholder)*

---

## 🔐 Demo Credentials

Want to jump right in? The database is automatically seeded with a demo account upon startup. Use these credentials to explore the platform without registering:

> **Email**: `nintrotishanth@gmail.com`  
> **Password**: `Password123!`

---

## 🛠️ Set Up and Run Instructions

Follow these instructions to get a local copy up and running in minutes.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Environment Configuration
Create a `.env` file in the root of the repository and add your configurations:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=nintro_db

# JWT Configuration
JWT_KEY=your_very_long_secret_key_at_least_32_chars
JWT_ISSUER=nintro-local
JWT_AUDIENCE=nintro-local

# Email (SMTP) - Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Nintro
```

### 3. Launch with Docker
Start the entire stack (Database, Backend, Frontend) with a single command:

```bash
docker compose up --build
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5181](http://localhost:5181)

---

## 📖 API Documentation

Nintro includes comprehensive interactive API documentation powered by Swagger. Once the backend is running, you can explore all available endpoints, required payloads, and test requests directly from your browser.

- 🔗 **Swagger UI**: [http://localhost:5181/swagger](http://localhost:5181/swagger)

---

## 🧪 Testing

Nintro is built with reliability in mind, featuring comprehensive test suites for both the backend and frontend.

**Backend (C# / xUnit):**
```bash
dotnet test backend.Tests/
```

**Frontend (TypeScript / Jest):**
```bash
cd frontend
npm test
```

<br/>

<div align="center">
  <p>Built with ❤️ by Tishanth Sivakumar</p>
  <p><b>© 2026 Nintro — Engineered for high performance.</b></p>
</div>

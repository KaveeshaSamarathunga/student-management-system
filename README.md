# Student Management System

A full-stack web application for managing students, intakes, and courses. Built for academic administration use.

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7   |
| Backend  | Python 3.12, Flask 3, Flask-JWT-Extended        |
| Database | PostgreSQL 16                                   |
| Auth     | JWT (access + refresh tokens)                   |
| Infra    | Docker, Docker Compose, Nginx                   |
| Testing  | pytest, pytest-cov                              |

---

## Features

- **Admin login** with JWT authentication and auto token refresh
- **Student directory** — search by name, ID, or intake
- **Student registration** with auto-generated student IDs
- **Student profile** — view and edit personal, contact, and guardian details; delete student
- **Intakes** — create and manage academic intakes with start/end dates
- **Courses** — add and delete courses; assign courses to intakes
- **Audit logs** — full history of all admin actions with search and CSV export
- **Dashboard** overview

---


---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/KaveeshaSamarathunga/student-management-system.git
cd student-management-system

# Build and start all services
docker compose up -d --build

Service	URL
Frontend	http://localhost:3000
Backend	    http://localhost:5000


### Running Tests

cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Run tests with coverage report
python -m pytest --cov=app --cov-report=term-missing tests/

# Task Board API - DevCraft Academy Team Project

Backend API for a Kanban board (like Trello/Linear). Built by your team as a 3-week project.

## Features

- ✅ Board Management (create, read, list)
- ✅ Task CRUD Operations (create, read, update, delete)
- ✅ Status Management (To Do, In Progress, Done)
- ✅ REST API Design
- ✅ Testing (Jest + Supertest)
- ✅ Deployment ready (Render/Railway)

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** Postgres + Prisma ORM
- **Testing:** Jest + Supertest
- **Deployment:** Render or Railway

## Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd task-board-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Run database migrations** (after Day 2, when schema is defined)

   ```bash
   npm run prisma:migrate
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Server runs at: http://localhost:3000

## Development

### Code Quality Checks

Before creating a merge request, make sure to run the following commands at least once to ensure code consistency and avoid linting or formatting issues:

```bash
npm run lint
npm run lint:fix
npm run format
```

These commands help catch potential issues early and keep the codebase clean and consistent across all contributors.

### Commands

```bash
npm run dev              # Start dev server with auto-reload
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:migrate   # Run database migrations
```

### Project Structure

```
task-board-api/
├── server.js           # Express server setup
├── routes/             # API route handlers (teams implement)
├── prisma/
│   └── schema.prisma   # Database schema (teams implement)
├── tests/
│   ├── setup.js        # Test configuration
│   └── *.test.js       # Test files
├── .env                # Environment variables (not committed)
├── .env.development    # Environment variables for development stage (not committed)
├── .env.production     # Environment variables production stage (not committed)
├── docker-compose.yaml # Easily start the DB locally using docker
└── package.json        # Dependencies
```

## API Endpoints

Base URL: `http://localhost:3000`

### Health Check

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| GET    | `/health` | Check API status |

**Response** `200 OK`

```json
{ "status": "ok", "message": "Task Board API is running" }
```

---

### Boards

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/boards`     | Get all boards     |
| GET    | `/boards/:id` | Get board by ID    |
| POST   | `/boards`     | Create a new board |
| DELETE | `/boards/:id` | Delete a board     |

#### GET /boards

Returns a list of all boards.

**Response** `200 OK`

```json
[{ "id": "abc123", "name": "My Board", "description": "...", "status": "..." }]
```

#### GET /boards/:id

**Response** `200 OK`

```json
{ "id": "abc123", "name": "My Board", "description": "...", "status": "..." }
```

**Error** `404 Not Found`

```json
{ "error": "Board with id abc123 is not found" }
```

#### POST /boards

**Request body** (`name` is required)

```json
{
  "name": "My Board",
  "description": "Optional description",
  "status": "Optional status"
}
```

**Response** `201 OK` — returns the created board object.

**Error** `400 Bad Request`

```json
{ "error": "Name of the board must be provided!" }
```

#### DELETE /boards/:id

**Response** `204 No Content`

---

### Tasks

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | `/:boardId/tasks`     | Get all tasks of a board |
| GET    | `/:boardId/tasks/:id` | Get a task of a board    |
| POST   | `/:boardId/tasks`     | Create a new task        |
| DELETE | `/tasks/:id`          | Delete a task            |

#### GET /:boardId/tasks

Returns a list of all tasks of the board with id = boardId.

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "611da98f-1542-40ea-8534-f29ba48713ea",
      "title": "My updated Task",
      "description": "My updated description",
      "status": "todo",
      "priority": "medium",
      "dueDate": null,
      "boardId": "974c0eda-a924-4716-9d7e-1fdd334c70c2",
      "createdAt": "2026-05-22T21:41:15.226Z",
      "updatedAt": "2026-05-22T21:47:50.730Z"
    }
  ]
}
```

#### GET /:boardId/tasks/:id

**Response** `200 OK`

```json
{
  "data": {
    "id": "611da98f-1542-40ea-8534-f29ba48713ea",
    "title": "My updated Task",
    "description": "My updated description",
    "status": "todo",
    "priority": "medium",
    "dueDate": null,
    "boardId": "974c0eda-a924-4716-9d7e-1fdd334c70c2",
    "createdAt": "2026-05-22T21:41:15.226Z",
    "updatedAt": "2026-05-22T21:47:50.730Z"
  }
}
```

**Error** `404 Not Found`

```json
{ "error": "Task not found" }
```

#### POST /:boardId/tasks

**Request body** (`title` is required)

```json
{
  "title": "My Task",
  "description": "My descrption"
}
```

**Response** `201 OK` — returns the created task object.

**Error** `400 Bad Request` if title is not provided or status is invalid

```json
{ "error": "Title must be provided" }
{ "error": "Status must be one of these: todo, in_progress, done" }
```

#### DELETE /boards/:id

**Response** `204 No Content`

#### PATCH /tasks/:id

**Request body** can be any property of the task

```json
{
  "title": "My new Task",
  "description": "My new descrption"
}
```

**Response** `200 OK` — returns the updated task object.

---

### Example curl Commands

```bash
# Get all boards
curl.exe http://localhost:3000/boards

# Get board by ID
curl.exe http://localhost:3000/boards/abc123

# Create a board
curl.exe -X POST http://localhost:3000/boards -H "Content-Type: application/json" -d "{\"name\": \"My Board\", \"description\": \"My description\"}"

# Delete a board
curl.exe -X DELETE http://localhost:3000/boards/abc123

# Get all tasks by board-ID
curl.exe http://localhost:3000/tasks/boardId123/tasks

# Get a task by id (board-ID is needed)
curl.exe http://localhost:3000/tasks/boardId123/tasks/abc123

# Create a task for board with board-ID
curl.exe -X POST http://localhost:3000/tasks/123abc/tasks -H "Content-Type: application/json" -d "{\"title\": \"My Task\", \"description\": \"My descrption\"}"

# Delete task by ID
curl.exe -X DELETE http://localhost:3000/tasks/tasks/abc123

# Update a task by ID
curl.exe -X PATCH http://localhost:3000/tasks/abc123 -H "Content-Type: application/json" -d "{\"title\": \"My updated Task\", \"description\": \"
My updated description\"}"

```

## Frontend (Test Client)

To test and interact with the API visually, we built a separate Angular frontend:

- **Repo:** [group-project-fe](https://github.com/dca-be-project-2026/group-project-fe)
- **Stack:** Angular 19 + Angular Material + Tailwind CSS
- **Purpose:** Test client to verify all API endpoints work correctly

To run locally:

```bash
git clone https://github.com/dca-be-project-2026/group-project-fe.git
cd group-project-fe
npm install
ng serve
```

Make sure the backend is running on `http://localhost:3000` before starting the frontend.

---

## Testing

Run tests:

```bash
npm test
```

Tests are located in `tests/` and use Jest + Supertest.

## Team Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write code + tests**
   - Follow TDD: Write failing test → Implement → Make test pass

3. **Run tests**

   ```bash
   npm test
   ```

4. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create Pull Request**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Code Review**
   - Get at least 1 approval
   - Address feedback
   - Merge to main

## Deployment

The API is hosted on a **Hostinger VPS** using Docker. Every push to `main` triggers an automatic deployment via GitHub Actions.

### Infrastructure

- **Server:** `srv1678925.hstgr.cloud` (Ubuntu 24.04)
- **API:** `http://187.127.87.16:3000`
- **Stack:** Docker + Docker Compose (API container + PostgreSQL container)
- **Admin:** Viktor

### How Auto-Deployment Works

1. Push to `main` on GitHub
2. GitHub Actions connects to the VPS via SSH
3. Runs `git pull origin main` + `docker compose up -d --build`
4. New version is live

Workflow config: `.github/workflows/deploy.yml`

### Required GitHub Secrets

| Secret     | Description                          |
| ---------- | ------------------------------------ |
| `VPS_HOST` | IP address of the VPS                |
| `VPS_USER` | SSH user (`root`)                    |
| `VPS_KEY`  | Private SSH key (without passphrase) |

### Environment Variables on the Server

Create `/app/.env` on the VPS with:

```env
DB_PASSWORD=your_secure_password
ALLOWED_ORIGINS=http://187.127.87.16:3000
```

### Manual Deployment (if needed)

SSH into the VPS and run:

```bash
cd /app
git pull origin main
docker compose up -d --build
```

### Useful Commands on the Server

```bash
docker compose ps               # Check container status
docker compose logs api         # View API logs
docker compose logs db          # View DB logs
docker compose down             # Stop all containers
```

## Team Roles

- **Code Quality Lead:** Code reviews, standards, consistency
- **Testing Lead:** Test strategy, coverage, CI/CD
- **Documentation Lead:** README, API docs, setup guides
- **Deployment Lead:** Deployment, troubleshooting, monitoring

## Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/ladjs/supertest)

## License

MIT - DevCraft Academy Team Project

# Project role distribution

- Thomas: Deployment Lead
- Yazan: Testing and Quality Lead
- Viktor: Documentation Lead

# API Reference

Base URL: `http://localhost:3000`

## Common Headers
Most endpoints (except login/register/health) require authentication.
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

---

## 1. Authentication (`/api/auth`)

### Register
Create a new user account.
- **URL:** POST `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "user": { "id": 1, "name": "User Name", "email": "user@example.com", "role": "user" },
    "token": "jwt_token_string"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing name, email, or password.
  - `409 Conflict`: Email already registered.

### Login
Authenticate an existing user.
- **URL:** POST `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "user": { "id": 1, "name": "User Name", "email": "user@example.com", "role": "user" },
    "token": "jwt_token_string"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

### Get Current User
Get details of the currently authenticated user.
- **URL:** GET `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: User not found.

---

## 2. Users (`/api/users`)

### List Users
Get a list of all registered users (for selection in dropdowns, etc.).
- **URL:** GET `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
  ```

---

## 3. Teams (`/api/teams`)

### List Teams
Get teams the current user belongs to.
- **URL:** GET `/api/teams`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Dev Team",
      "created_at": "timestamp",
      "members_count": 3
    }
  ]
  ```

### Create Team
Create a new team. The creator automatically becomes a member/owner.
- **URL:** POST `/api/teams`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  { "name": "New Team Name" }
  ```
- **Success Response (201 Created):**
  ```json
  { "id": 2, "name": "New Team Name", "created_at": "timestamp" }
  ```
- **Error Responses:**
  - `400 Bad Request`: Name required.

### Delete Team
Delete a team (must be a member).
- **URL:** DELETE `/api/teams/:teamId`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `403 Forbidden`: Not a team member.
  - `404 Not Found`: Team not found.

### List Team Members
Get all members of a specific team.
- **URL:** GET `/api/teams/:teamId/members`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
  ```

### Add Team Member
Add a user to a team.
- **URL:** POST `/api/teams/:teamId/members`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "userId": 2,
    "role": "member" // Optional, default: "member"
  }
  ```
- **Success Response (204 No Content)**
- **Error Responses:**
  - `400 Bad Request`: Missing userId.
  - `403 Forbidden`: Requester is not a team member.

### Remove Team Member
Remove a user from a team.
- **URL:** DELETE `/api/teams/:teamId/members/:userId`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `403 Forbidden`: Requester is not a team member.
  - `404 Not Found`: Team not found.

---

## 4. Projects (`/api/projects`)

### List Projects
Get all projects for teams the user belongs to.
- **URL:** GET `/api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "team_id": 1,
      "name": "Project Alpha",
      "description": "...",
      "status": "active",
      "created_at": "..."
    }
  ]
  ```

### Create Project
Create a new project in a team.
- **URL:** POST `/api/projects`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "teamId": 1,
    "name": "Project Beta",
    "description": "Optional description"
  }
  ```
- **Success Response (201 Created):** Returns the created project object.
- **Error Responses:**
  - `400 Bad Request`: Missing teamId or name.
  - `403 Forbidden`: User not in the specified team.

### Update Project
Update project details.
- **URL:** PATCH `/api/projects/:projectId`
- **Headers:** `Authorization: Bearer <token>`
- **Body** (all fields optional):
  ```json
  {
    "name": "New Name",
    "description": "New Description",
    "status": "completed"
  }
  ```
- **Success Response (200 OK):** Returns the updated project object.
- **Error Responses:**
  - `400 Bad Request`: No valid fields to update.
  - `403 Forbidden`: User not in the project's team.
  - `404 Not Found`: Project not found.

### Delete Project
Delete a project.
- **URL:** DELETE `/api/projects/:projectId`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `403 Forbidden`: User not in the project's team.
  - `404 Not Found`: Project not found.

---

## 5. Tasks (`/api/tasks`)

### List Tasks
Get tasks. Can be filtered by project.
- **URL:** GET `/api/tasks`
- **Query Params:**
  - `projectId` (optional): Filter tasks for this project.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 10,
      "project_id": 1,
      "title": "Fix verify button",
      "description": "...",
      "status": "todo",
      "priority": "high",
      "assignee_id": 2,
      "due_date": "2023-12-31",
      "order_index": 0
    }
  ]
  ```
- **Error Responses:**
  - `403 Forbidden`: If `projectId` provided and user not in team.

### Create Task
Create a new task.
- **URL:** POST `/api/tasks`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "projectId": 1,
    "title": "New Task",
    "description": "...",
    "status": "todo",         // optional: todo, in_progress, done
    "priority": "normal",     // optional: low, normal, high
    "assigneeId": 2,          // optional: userId
    "dueDate": "YYYY-MM-DD",  // optional
    "orderIndex": 0           // optional
  }
  ```
- **Success Response (201 Created):** Returns created task.
- **Error Responses:**
  - `400 Bad Request`: Missing projectId or title.
  - `403 Forbidden`: User not in project's team.

### Update Task
Update task fields.
- **URL:** PATCH `/api/tasks/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body** (all fields optional):
  ```json
  {
    "title": "Updated Title",
    "status": "done",
    "priority": "high",
    "assignee_id": 3
    // ... any other task field
  }
  ```
- **Success Response (200 OK):** Returns updated task.
- **Error Responses:**
  - `400 Bad Request`: No valid fields to update.
  - `403 Forbidden`: User not in project's team.
  - `404 Not Found`: Task not found.

### Delete Task
Delete a task.
- **URL:** DELETE `/api/tasks/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**
- **Error Responses:**
  - `403 Forbidden`: User not in project's team.
  - `404 Not Found`: Task not found.

---

## 6. Comments (`/api/comments`)

### List Comments
Get comments for a specific task.
- **URL:** GET `/api/comments`
- **Query Params:**
  - `taskId` (required): ID of the task.
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "task_id": 10,
      "user_id": 2,
      "body": "This is a comment",
      "created_at": "...",
      "author_name": "Bob"
    }
  ]
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing `taskId`.
  - `403 Forbidden`: User not in project's team.

### Create Comment
Add a comment to a task.
- **URL:** POST `/api/comments`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "taskId": 10,
    "body": "Great work!"
  }
  ```
- **Success Response (201 Created):** Returns created comment.
- **Error Responses:**
  - `400 Bad Request`: Missing taskId or body.
  - `403 Forbidden`: User not in project's team.


# Todo app (Vite + Express + Postgres)

Full-stack Todo manager with categories, undoable actions, and a 5-task limit per category.

## Features
- Create tasks with text and category
- Filter by category
- Mark tasks as completed (undoable within 5 seconds)
- Delete tasks (undoable within 5 seconds)
- Backend validation: max 5 tasks per category
- Loading, error, and empty states in UI

Default categories: **Work**, **Personal**, **Home**, **Study**.

## Run with Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

## Run locally

### 1. Backend
```bash
cd backend
npm install
```

Set `backend/.env`:
```
DATABASE_URL=postgresql://todo:todo@localhost:5432/todo_app
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

Start the server:
```bash
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Optionally adjust `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

## API
- `GET /todos?category=<categoryId>`
- `POST /todos` → `{ text, categoryId }`
- `PATCH /todos/:id` → `{ completed }`
- `DELETE /todos/:id`
- `GET /categories`

## Deploy to GitHub Pages (frontend)
This deploys **only the frontend**. You still need a hosted backend and must set its URL.

1. Push the repository to GitHub.
2. In the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. In **Settings → Variables**, add:
   - `VITE_API_URL` → your публичный backend URL (e.g. `https://your-backend.example.com`)
4. Push to `main` and the workflow `.github/workflows/deploy-pages.yml` will publish the site.

The deployed URL will be:
`https://<owner>.github.io/<repo>/`

## Links
- Repo: <YOUR_GITHUB_REPO_URL>
- Demo: <YOUR_GITHUB_PAGES_URL>

## AI usage answers
1. **Did you use AI at any stage while working on this task? Why?**  
Yes. I used AI to speed up scaffolding, keep the backend/frontend consistent.

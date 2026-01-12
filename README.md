🚀 Devboard

Devboard is a modern project & task management web application built with a full-stack JavaScript architecture.
It supports team collaboration, role-based access, secure authentication, password recovery, and a clean dark UI.

⸻

✨ Features

🔐 Authentication & Security
	•	User registration & login (JWT-based)
	•	Secure password hashing (bcrypt)
	•	Forgot password flow with email verification
	•	Reset password using time-limited codes
	•	Role-based access control (owner, editor, viewer)

📂 Projects
	•	Create and manage projects
	•	Archive projects
	•	View project status
	•	Invite members via email
	•	Assign roles per project

✅ Tasks
	•	Create, edit, delete tasks
	•	Task fields:
	•	Title
	•	Description
	•	Priority (low / medium / high)
	•	Status (backlog / in progress / done)
	•	View-only mode for viewers
	•	Inline editing for owners/editors

👥 Collaboration
	•	Share projects with teammates
	•	Viewer access (read-only)
	•	Editor access (can modify tasks)
	•	Owner access (full control)

✉️ Contact Page
	•	Public contact form
	•	Sends emails using Resend
	•	No authentication required

🎨 UI / UX
	•	Dark modern theme
	•	Pure CSS (no UI framework)
	•	Responsive layout
	•	Fixed navbar & sticky footer
	•	Clean, professional styling

⸻

🛠️ Tech Stack

Frontend
	•	React
	•	React Router
	•	Pure CSS (custom theme)
	•	Fetch API

Backend
	•	Node.js
	•	Express
	•	PostgreSQL
	•	JWT Authentication
	•	bcrypt
	•	Resend (Email service)

Database
	•	PostgreSQL
	•	Role-based schema
	•	Password reset tokens table
📁 Project Structure
/client
  ├─ src
  │  ├─ pages
  │  ├─ components
  │  ├─ api
  │  ├─ styles
  │  └─ App.jsx

/server
  ├─ controllers
  ├─ routes
  ├─ middleware
  ├─ db
  └─ server.js

  ▶️ Running the Project Locally

1️⃣ Clone the repo
git clone https://github.com/your-username/devboard.git
cd devboard
2️⃣ Install dependencies
Backend
cd server
npm install
npm run dev
Frontend
cd client
npm install
npm run dev
3️⃣ Open in browser
http://localhost:5173

🔄 Password Reset Flow (How It Works)
	1.	User clicks Forgot Password
	2.	Enters email
	3.	Backend generates a reset code
	4.	Code is sent via email (Resend)
	5.	User enters code + new password
	6.	Password is securely updated
  🧑‍💻 Roles & Permissions
  Role
Permissions
Owner
Full control, manage users
Editor
Create/edit/delete tasks
Viewer
Read-only access
📦 Future Improvements
	•	Dockerized deployment
	•	Task due dates
	•	Notifications
	•	Activity logs
	•	Task comments
	•	Drag & drop board view
	•	Automated testing

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

📜 License

This project is licensed under the MIT License.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

## Database Setup

This project uses PostgreSQL.

On first run, database tables are created automatically via Docker
using the schema file:

backend/db/schema.sql

If you reset volumes manually, you can reapply the schema with:

```bash
docker compose exec -T db psql -U ilyassoudli -d devboard < backend/db/schema.sql
```
How to confirm it worked

```After containers are up:
docker compose exec db psql -U ilyassoudli -d devboard -c "\dt"
```You should see your tables like users, projects, etc.
Runnig the sql file 
docker compose exec -T db psql -U ilyassoudli -d devboard < backend/src/db/schema.sql
⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻
👋 Author

Built by ILYASS OUDLI
Full-stack developer | QA Engineer | Software Enginner

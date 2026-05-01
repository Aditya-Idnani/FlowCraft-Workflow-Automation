# 🚀 FlowCraft — Visual Workflow Automation Platform

FlowCraft is a modern, node-based workflow automation platform inspired by tools like n8n and Zapier.
It allows users to visually create, connect, and execute workflows with a clean, futuristic UI.

---

## ✨ Features

### 🧠 Visual Workflow Builder

* Drag-and-drop node editor (React Flow)
* Connect nodes with curved edges
* Custom node components
* Interactive canvas with zoom & pan

### ⚙️ Execution Engine

* Graph-based execution (not just linear)
* Step-by-step execution flow
* Execution logs and history
* Node states:

  * ⏳ Running
  * ✅ Success
  * ❌ Failed

### 🎨 Modern UI/UX

* Dark + Light mode
* Glassmorphism + soft neon glow
* Smooth animations (hover, transitions)
* Responsive layout

### 🔐 Authentication (in progress)

* Supabase integration (planned)
* Google OAuth (planned)

### 🗂 Workflow Management

* Create, edit, delete workflows
* Add/remove steps dynamically
* Execution history tracking

---

## 🏗 Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* React Flow
* Framer Motion

### Backend

* Node.js
* Express
* Prisma ORM
* REST API

---

## 📁 Project Structure

```
FlowCraft-Workflow-Automation/
│
├── backend/           # Express + Prisma API
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── frontend/          # Next.js frontend
│   ├── src/
│   ├── app/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repo

```
git clone https://github.com/YOUR_USERNAME/FlowCraft-Workflow-Automation.git
cd FlowCraft-Workflow-Automation
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
DATABASE_URL=your_database_url
PORT=5050
```

Run backend:

```
npm run dev
```

Backend runs on:

```
http://localhost:5050
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### Workflows

* `GET /api/workflows`
* `POST /api/workflows`
* `GET /api/workflows/:id`

### Steps

* `POST /api/workflows/:id/steps`
* `DELETE /api/workflows/:id/steps/:stepId`

### Execution

* `POST /api/workflows/:id/execute`
* `GET /api/workflows/executions`

---

## 🧪 Example Flow

1. Create a workflow
2. Add steps (nodes)
3. Connect nodes
4. Click execute
5. Watch step-by-step execution

---

## 🛣 Roadmap

* [ ] Real integrations (Google Calendar, Telegram, Webhooks)
* [ ] OAuth authentication (Supabase)
* [ ] Persistent execution engine (queue system)
* [ ] Retry + error handling system
* [ ] Deploy to cloud (Vercel + backend hosting)

---

## 🧑‍💻 Author

**Aditya Idnani**

---

## ⭐ Inspiration

* n8n
* Zapier
* Linear UI
* Vercel dashboard aesthetics

---

## 📌 Notes

This project is actively being developed and improved.
UI, performance, and integrations will continue evolving.

---

🔥 If you like this project, consider starring the repo!

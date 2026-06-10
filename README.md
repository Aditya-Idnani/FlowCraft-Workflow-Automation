# 🚀 FlowCraft — Visual Workflow Automation Platform

FlowCraft is a modern workflow automation platform inspired by tools like **n8n**, **Zapier**, and **Make**.

It enables users to visually design, connect, and execute automated workflows through an interactive node-based canvas. Users can build automation pipelines by connecting triggers and actions, monitor execution progress in real time, and manage workflows through an intuitive dashboard.

---

## 🌐 Live Demo

**Frontend:** (https://flow-craft-workflow-automation.vercel.app/)

**Backend API:** (https://flowcraft-workflow-automation.onrender.com)

---

### Landing Page

<img width="1527" height="1042" alt="image" src="https://github.com/user-attachments/assets/b3bd0f81-d531-4867-8d31-c70e23ab930b" />


### Workflow Builder

<img width="1511" height="1045" alt="image" src="https://github.com/user-attachments/assets/ee576001-29d7-4235-a0df-5a344a710310" />


### Dashboard

<img width="1522" height="1040" alt="image" src="https://github.com/user-attachments/assets/3d3ab116-9eb0-4c8f-b060-83149e769316" />


---

# ✨ Features

## 🎨 Modern User Experience

* Premium landing page experience
* Dark and light themes
* Responsive design
* Smooth animations and transitions
* Glassmorphism-inspired UI
* Interactive workflow canvas

---

## 🔐 Authentication

* Email & Password Authentication
* Google OAuth Login
* Secure session management with Supabase Auth
* Protected routes

---

## ⚙️ Visual Workflow Builder

* Drag-and-drop node editor
* Connect nodes visually
* Dynamic workflow creation
* Real-time workflow editing
* Node-based architecture inspired by n8n
* Interactive execution flow visualization

---

## 📊 Workflow Management

* Create workflows
* Edit workflows
* Execute workflows
* View execution history
* Dashboard analytics
* Workflow status tracking

---

## 🗄️ Database Integration

* PostgreSQL Database
* Prisma ORM
* Neon Serverless Database
* Migration management
* Scalable data architecture

---

## ☁️ Cloud Deployment

### Frontend

* Next.js
* Hosted on Vercel

### Backend

* Node.js + Express
* Hosted on Render

### Database

* Neon PostgreSQL

### Authentication

* Supabase Auth

---

# 🏗️ Tech Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* React Flow (@xyflow/react)
* Framer Motion

## Backend

* Node.js
* Express.js
* Prisma ORM
* JWT Authentication
* REST APIs

## Database

* PostgreSQL
* Neon

## Authentication

* Supabase Auth
* Google OAuth

## Deployment

* Vercel
* Render

---

# 🧠 Architecture

```text
User
 │
 ▼
Frontend (Next.js / Vercel)
 │
 ├── Supabase Authentication
 │
 ▼
Backend API (Express / Render)
 │
 ▼
Prisma ORM
 │
 ▼
Neon PostgreSQL
```

---

# 📂 Project Structure

```text
FlowCraft/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── components/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── routes/
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Aditya-Idnani/FlowCraft-Workflow-Automation.git

cd FlowCraft-Workflow-Automation
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Backend runs on:

```text
http://localhost:5050
```

---

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

### Backend

```env
DATABASE_URL=
JWT_SECRET=
```

---

# 🎯 Learning Outcomes

This project helped me gain practical experience with:

* Workflow automation systems
* Visual node-based interfaces
* Full-stack application development
* Authentication and OAuth
* Database design
* Cloud deployment
* Prisma ORM
* PostgreSQL
* API architecture
* Production debugging and deployment

---

# 🔮 Future Enhancements

* Telegram Integration
* Google Calendar Integration
* Email Automation
* Webhook Support
* Workflow Scheduling
* AI-powered workflow generation
* Marketplace for workflow templates
* Team collaboration features

---

# 👨‍💻 Author

**Aditya Idnani**

SRM Institute of Science and Technology

GitHub: https://github.com/Aditya-Idnani


---

## ⭐ Support

If you found this project interesting, consider giving it a star on GitHub.

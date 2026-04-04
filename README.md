# Smart Hostel Management System

A comprehensive, full-stack hostel management solution built with Next.js, Express, and PostgreSQL. It streamlines administrative tasks, enhances student convenience, and improves security through automated entry/exit logging.

## 🏗️ Project Architecture

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS (Glassmorphism UI)
- **Backend**: Express.js, TypeORM, PostgreSQL, JWT Authentication
- **Security**: Role-based access control (RBAC), QR-based authentication for entry/exit

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine **without using Docker**.

### 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher) installed and running
- **npm** or **yarn**

---

### 1️⃣ Database Setup (Manual)

1. **Open PostgreSQL** (via pgAdmin or terminal `psql`):
   ```sql
   CREATE DATABASE hostel_management;
   ```

2. **Verify connection**: Ensure your PostgreSQL service is running and you have the credentials (username/password) ready.

---

### 2️⃣ Backend Configuration

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory (copy from `.env.example` if available):
   ```env
   PORT=5000
   DATABASE_URL=postgres://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/hostel_management
   JWT_SECRET=your_super_secret_key_here
   FRONTEND_URL=http://localhost:3000
   ```
   *Note: Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your actual PostgreSQL credentials.*

4. **Start the Backend**:
   The backend uses TypeORM with `synchronize: true`, so it will automatically create tables on startup.
   ```bash
   npm run dev
   ```
   *Server will run on `http://localhost:5000`*

---

### 3️⃣ Frontend Configuration

1. **Navigate to frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the Frontend**:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:3000`*

---

## 🔑 Default Credentials

Use these accounts to explore the different roles in the system.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@hostel.com` | `admin123` |
| **Warden** | `warden@hostel.com` | `warden123` |
| **Student** | `student@hostel.com` | `student123` |
| **Security Guard** | `security@hostel.com` | `security123` |

---

## 🛠️ Features by Role

For a detailed breakdown of what each user can do, please refer to the **[FEATURES.md](./FEATURES.md)** file.

- **Super Admin**: System configuration and user oversight.
- **Warden**: Daily administration, room allocations, and student management.
- **Student**: Room requests, resource booking, marketplace, and QR logs.
- **Security**: Entry/exit monitoring and visitor management.

---

## 🔒 Security Note
This project uses JWT for authentication. Ensure `JWT_SECRET` is kept confidential in production environments.

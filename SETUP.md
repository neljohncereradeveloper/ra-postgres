# Setup Guide

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **Yarn** (preferred, but npm/pnpm/bun can be used for the frontend)
- **Docker & Docker Compose** (for containerized setup)
- **MySQL** (if not using Docker for the database)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

---

## 2. Environment Variables

- There are references to `.env` files for both `server` and `web`. Make sure to create them if they do not exist.
- Use the variables from `docker-compose.yml` as a template for your `.env` files.

### Example: `server/.env`

```
PORT=5670
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN=http://localhost:3050
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=db_port
DB_USERNAME=db_username
DB_PASSWORD=db_password
DB_DATABASE=db_database
DB_LOGGING=false
AUTH_SECRET=your_auth_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
DEVELOPER_KEY=secret
ADMIN_PASSWORD=admin
```

### Example: `web/.env`

```
NEXT_PUBLIC_API_URL=http://localhost:5670/api/v1
NODE_ENV=production
```

---

## 3. Running with Docker Compose (Recommended)

This will build and run both the backend (NestJS) and frontend (Next.js) in containers.

```bash
docker-compose up --build
```

- The backend will be available at: `http://localhost:5670`
- The frontend will be available at: `http://localhost:5650`

---

## 4. Database Setup

- If not using Docker, ensure you have a MySQL database running and update the credentials in `server/.env`.
- Create a database named `districtassembly` (or as specified in your `.env`).

---

## 5. Additional Notes

- For more details, see the `README.md` files in both `web` and `server` directories.
- Adjust ports and environment variables as needed for your local setup.

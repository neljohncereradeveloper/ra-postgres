# District Assembly Server (Backend)

This is the backend for the District Assembly project, built with [NestJS](https://nestjs.com/).

## Prerequisites

- Node.js (v16 or higher recommended)
- Yarn
- MySQL (if not using Docker)
- Optionally: Docker & Docker Compose

---

## Getting Started (Locally)

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Set up environment variables:**

   - Copy or create a `.env` file in the `server` directory. Example:
     ```
     PORT=5670
     HOST=0.0.0.0
     NODE_ENV=production
     CORS_ORIGIN=http://localhost:3050
     DB_TYPE=mysql
     DB_HOST=localhost
     DB_PORT=3306
     DB_USERNAME=your_db_user
     DB_PASSWORD=your_db_password
     DB_DATABASE=districtassembly
     DB_LOGGING=false
     AUTH_SECRET=your_auth_secret
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=1d
     DEVELOPER_KEY=secret
     ADMIN_PASSWORD=admin
     ```
   - Ensure your MySQL database is running and matches the credentials above.

3. **Run the development server:**
   ```bash
   yarn start:dev
   ```
   The backend will be available at [http://localhost:5670](http://localhost:5670)

---

## Running with Docker

1. Ensure you have Docker and Docker Compose installed.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
   - The backend will be available at [http://localhost:5670](http://localhost:5670)
   - The frontend will be available at [http://localhost:5650](http://localhost:5650)

---

## Project Structure

- `src/` - Main source code for the NestJS app
- `test/` - Test files
- `dist/` - Compiled output
- `logs/` - Log files
- `docs/` - Documentation

---

## Scripts

- `yarn start:dev` - Start in development mode (with hot reload)
- `yarn start` - Start in production mode
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn test:cov` - Run test coverage

---

## Environment Variables

- `PORT` - Port to run the server
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` - MySQL connection
- `AUTH_SECRET`, `JWT_SECRET`, etc. - Security and authentication

---

## Database Setup

- If not using Docker, ensure you have a MySQL database running and update the credentials in `server/.env`.
- Create a database named `districtassembly` (or as specified in your `.env`).

---

## Connecting to the Frontend

- The frontend (Next.js) expects the backend API to be available at `http://localhost:5670/api/v1` (configurable via `NEXT_PUBLIC_API_URL` in the frontend `.env`).

---

## Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [District Assembly Frontend](../web/README.md)

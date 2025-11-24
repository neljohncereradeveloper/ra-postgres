# District Assembly Web (Frontend)

This is the frontend for the District Assembly project, built with [Next.js](https://nextjs.org).

## Prerequisites

- Node.js (v16 or higher recommended)
- Yarn (or npm/pnpm/bun)
- Optionally: Docker & Docker Compose

---

## Getting Started (Locally)

1. **Install dependencies:**

   ```bash
   yarn install
   # or
   npm install
   ```

2. **Set up environment variables:**

   - Copy or create a `.env` file in the `web` directory. Example:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5670/api/v1
     NODE_ENV=production
     ```
   - Ensure the backend is running and accessible at the URL above.

3. **Run the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running with Docker

1. Ensure you have Docker and Docker Compose installed.
2. From the project root, run:
   ```bash
   docker-compose up --build
   ```
   - The frontend will be available at [http://localhost:5650](http://localhost:5650)
   - The backend will be available at [http://localhost:5670](http://localhost:5670)

---

## Project Structure

- `src/` - Main source code for the Next.js app
- `public/` - Static assets
- `components.json`, `tsconfig.json`, etc. - Project configuration files

---

## Environment Variables

- `NEXT_PUBLIC_API_URL` - The URL of the backend API
- `NODE_ENV` - Node environment (usually `development` or `production`)

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [District Assembly Backend](../server/README.md)

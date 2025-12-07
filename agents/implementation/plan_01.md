# Implementation Plan: Graphics AI Workshop – Initial Stack & Scaffolding

## 1. Overview
Goal: Set up a TypeScript-based Express backend and React/Vite frontend, wired to MariaDB, AWS S3, and the Google AI Studio (Gemini) API, with multi-user auth and initial "spaces" support as the foundation for a graphics/character workshop.

In scope:
- Choose and document the Node.js version and base tooling for the repo.
- Scaffold a TypeScript Express backend with environment configuration and basic health check.
- Configure Google Gemini client (`@google/generative-ai`), AWS S3 client, and MariaDB connection (using `mysql2`, no ORM).
- Establish a simple SQL migration document with `IF NOT EXISTS` statements and define initial schema for users and spaces.
- Scaffold a React + Vite + TypeScript frontend with basic routing and an auth-ready layout.
- Implement minimal auth and spaces APIs and wire them to the frontend.

Out of scope (for this plan):
- Detailed character, scene/background, style, and composition models.
- Image generation workflows and seed management for continuity.
- Video pipeline integration.
- Advanced auth flows (password reset, OAuth/Social login) and full production-ready security hardening.
- CI/CD and deployment automation.

---

## 2. Step-by-Step Plan

1. Establish Node version and repo structure  
   Status: Pending  
   Testing: Confirm `node -v` matches the chosen version (e.g., 22.x LTS) and that both backend and frontend directories are created with valid `package.json` files; run `npm install` in each without errors.  
   Checkpoint: Wait for developer approval before proceeding.

2. Scaffold TypeScript Express backend with basic health route  
   Status: Pending  
   Testing: Run the backend dev script (e.g., `npm run dev`) and verify a `/health` endpoint responds with HTTP 200 and a simple JSON payload in a browser or via `curl`.  
   Checkpoint: Wait for developer approval before proceeding.

3. Configure environment management, Google AI client, and AWS S3 client  
   Status: Pending  
   Testing: Start the backend with a `.env` file containing placeholders like `GOOGLE_API_KEY`, DB, and S3 settings; verify the app boots without throwing and logs that Gemini and S3 clients are configured (without making external network calls).  
   Checkpoint: Wait for developer approval before proceeding.

4. Set up MariaDB connection layer and migrations document  
   Status: Pending  
   Testing: Implement a small connection check using `mysql2` and run it to confirm the backend can connect to MariaDB; execute the initial migration document (e.g., `db/migrations.sql`) and ensure it runs without errors.  
   Checkpoint: Wait for developer approval before proceeding.

5. Define initial DB schema for users and spaces  
   Status: Pending  
   Testing: Use SQL with `IF NOT EXISTS` to create core tables (e.g., `users`, `spaces`) and any basic indexes; verify via MariaDB tools (such as MySQL Workbench) that the tables exist with expected columns and that simple insert/select queries succeed.  
   Checkpoint: Wait for developer approval before proceeding.

6. Scaffold React + Vite + TypeScript frontend with basic routing and auth-ready layout  
   Status: Pending  
   Testing: Run `npm run dev` in the frontend app, open it in the browser, and verify that routes like `/login`, `/register`, and a placeholder `/dashboard` render correctly.  
   Checkpoint: Wait for developer approval before proceeding.

7. Implement minimal auth API and wire frontend to it  
   Status: Pending  
   Testing: Use frontend forms and/or a tool like Postman to verify that registration and login work end-to-end (backend creates a user record and issues a token or cookie; protected endpoints reject unauthenticated requests and accept authenticated ones).  
   Checkpoint: Wait for developer approval before proceeding.

8. Implement basic spaces API and frontend screens  
   Status: Pending  
   Testing: Create, list, and delete spaces via the API; confirm they are persisted in MariaDB and that the frontend can display and interact with the user’s spaces (e.g., create a space and see it appear in a dashboard list).  
   Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Pending.  
- Step 2 — Status: Pending.  
- Step 3 — Status: Pending.  
- Step 4 — Status: Pending.  
- Step 5 — Status: Pending.  
- Step 6 — Status: Pending.  
- Step 7 — Status: Pending.  
- Step 8 — Status: Pending.


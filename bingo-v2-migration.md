# Bingo V2 Migration Plan

## Phase 1: Context & Requirements
- **Objective:** Migrate V1 (Single-file HTML) to V2 (Full-stack Express + SPA Next.js) with real-time Socket.io.
- **Users:** Admin (requires local auth) and Players (Anonymous, access via QR code).
- **Architecture:** Monorepo with `/frontend` (Next.js SPA) and `/backend` (Express API).
- **Stack:** Node.js, Express, MongoDB (Mongoose), Socket.io, Next.js, Bootstrap.

## Phase 2: System Architecture
- **Backend (Port 5000)**
  - RESTful API with Express.js + Mongoose for Data Persistence.
  - JWT Authentication for the Admin user.
  - WebSockets (Socket.io) for real-time game state synchronization.
- **Frontend (Port 3000)**
  - Next.js (App Router, configured as Client-side/SPA as much as possible).
  - Integration with `socket.io-client`.
  - Responsive UI powered by Bootstrap (as requested).
  - Keeps the existing Text-To-Speech (Voz) logic natively in the browser.

## Phase 3: Step-by-Step Task Breakdown
- [ ] **Task 1: Project Initialization**
  - Create `/backend` with standard Node.js Express setup.
  - Create `/frontend` using `create-next-app` & Bootstrap.
- [ ] **Task 2: Backend - Models & Auth**
  - Create Models for `Admin` and `Room`.
  - Implement `/api/auth/login` and `/api/auth/register` (for first admin).
- [ ] **Task 3: Backend - Real-time Game Engine (Socket.io)**
  - Establish connection, handle `join_room`, `draw_number`, `bingo_called` events.
- [ ] **Task 4: Frontend - Admin Dashboard**
  - Create Login UI and Admin Session.
  - Replicate V1 Bingo UI (Board, Controls, Voice, History).
  - Add "Create Game" feature that generates a QR Code (`qrcode.react` or similar).
- [ ] **Task 5: Frontend - Player View & Bingo Cards**
  - Create page `/play/:roomId` accessed via QR code.
  - Implement algorithm to generate unique random bingo cards (15-number 75-ball formatted layout).
  - Listen to Socket.io events to automatically mark numbers on the player's card or manual marking verification.
- [ ] **Task 6: Final Testing & Optimization**
  - Simulate multiple players joining.
  - Verify UI aesthetics and performance across mobile (Player) and Desktop (Admin).

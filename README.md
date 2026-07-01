# FE-Task: Task Annotation App 🚀

Welcome to the Task Annotation Application! This frontend project is built with Next.js, Redux Toolkit, and Tailwind CSS to manage and annotate a live feed of tasks.

## ✨ Features

- **Live Data Feed**: Real-time updates handled via WebSocket integration.
- **Robust State Management**: Built with RTK Query and Redux entity adapters to seamlessly merge paginated API data with real-time websocket updates.
- **Secure AI Summaries**: Streams AI-generated summaries via Server-Sent Events (SSE). Markdown is safely parsed and sanitized using `marked` and `isomorphic-dompurify` to prevent XSS attacks.
- **Client-Side Persistence**: Uses IndexedDB (`localforage`) for fast hydration on reload.
- **Resilient Data Normalization**: Gracefully handles messy or missing API data payloads.

## 🛠️ Tech Stack

- **Framework**: Next.js (React)
- **State Management**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS
- **Testing**: Jest & React Testing Library
- **Other Tools**: `marked`, `isomorphic-dompurify`, `localforage`

## 🚀 Getting Started

### 1. Start the Mock Server
The application relies on a local mock server to provide the API, WebSockets, and SSE streams.
```bash
cd mock-server
node server.js
```
*The mock server runs on `http://localhost:4000`.*

### 2. Run the Next.js App
In a new terminal window, start the frontend development server:
```bash
cd annotation-app
npm install
npm run dev
```
*The application runs on `http://localhost:3000`.*

## 🧠 Architecture & Decisions
Curious about the technical tradeoffs made in this project? Check out the [DECISIONS.md](./DECISIONS.md) file for an in-depth look at state management, security handling, and bug fixes!

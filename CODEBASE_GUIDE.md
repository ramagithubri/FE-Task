# 📚 FE-Task Codebase Guide

This document explains how the three main folders (`mock-server`, `annotation-app`, and `buggy`) work together, and breaks down the core technologies used so you know exactly where to make changes in the future.

---

## 1. Directory Overview

### 🖥️ `mock-server/`
This is the backend of your application. It runs locally on port 4000.
- **`server.js`**: The only file here. It uses Node.js and Express to create a fake database of 137 tasks. 
  - It provides a **REST API** (`GET /api/tasks`) for pagination.
  - It provides a **WebSocket Server** to send live updates (like task status changes) every few seconds.
  - It provides an **SSE (Server-Sent Events) endpoint** to stream fake AI-generated summaries.

### 🐞 `buggy/`
This folder contains a single file: `TaskTicker.tsx`. 
- This was an isolated React debugging assessment. It contained intentional bugs like stale closures (`tick` not updating), state mutation (`prev.push`), and missing `useEffect` dependencies. It is not part of the main application.

### 🚀 `annotation-app/`
This is the main Frontend application built with **Next.js**. It runs locally on port 3000.
- **`src/app/`**: Contains Next.js App Router files (`layout.tsx`, `page.tsx`). This is where the UI starts.
- **`src/components/`**: Contains reusable React components (`TaskList`, `TaskDetail`, `ActivityConsole`).
- **`src/lib/`**: Contains the core logic (Redux store, RTK Query API, data normalizers, and TypeScript types).
- **`src/hooks/`**: Contains custom React hooks (like `useTaskFeed.ts` which manages the WebSocket connection).

---

## 2. Core Technologies Explained

### ⚛️ Next.js & React
- **How it works:** Next.js is a React framework. It uses file-based routing. The file `src/app/page.tsx` represents the main home page of your app (`/`).
- **Where to make changes:** If you want to change the layout of the page, add a new sidebar, or change the title, edit `src/app/page.tsx` and `src/app/layout.tsx`.

### 🎨 Tailwind CSS
- **How it works:** Tailwind uses utility classes directly in the HTML/JSX (e.g., `className="flex flex-col bg-gray-100 p-4"`). It means you don't write separate `.css` files.
- **Where to make changes:** To change colors, spacing, or layout of a component, look at the `className` string inside the component's `.tsx` file (e.g., `TaskList.tsx`).

### 🟦 TypeScript
- **How it works:** TypeScript adds strict types to JavaScript. It ensures that a `Task` always has an `id`, `title`, and `status`. 
- **Where to make changes:** Look in `src/lib/types.ts`. If the backend adds a new field (like `priority`), you MUST add it to the `Task` interface in `types.ts` first, or TypeScript will throw an error when you try to use it.

### 📦 Redux Toolkit (RTK) & RTK Query
- **How it works:** Redux is a global state container. Instead of passing props down 5 levels, any component can read from the Redux store.
  - **RTK Query (`src/lib/api.ts`)**: This handles fetching the initial paginated data from the mock-server's REST API. It handles caching and loading states automatically.
  - **Redux Slice (`src/lib/tasksSlice.ts`)**: This stores the list of tasks in memory. It allows the app to quickly update a single task when a WebSocket message arrives.
- **Where to make changes:** If you need to fetch a new API endpoint, add it to `api.ts`. If you need to store new global UI state, edit `tasksSlice.ts`.

### 🔌 WebSockets (`useTaskFeed.ts`)
- **How it works:** WebSockets keep a permanent, open connection between the browser and the `mock-server`. When a task changes on the server, the server pushes an event to the browser instantly without the browser having to ask.
- **Where to make changes:** The file `src/hooks/useTaskFeed.ts` manages this connection. It listens for `message` events, parses the JSON, and dispatches an update to the Redux store.

### 🧪 Jest (Testing)
- **How it works:** Jest is a testing framework. React Testing Library is used alongside it to render components in a fake DOM and simulate user clicks to make sure they work.
- **Where to make changes:** Look at `src/components/TaskList.test.tsx`. If you add a new button to the `TaskList`, you should write a test in here that uses `fireEvent.click()` to ensure it works.

---

## 3. The Data Flow (Step-by-Step)
If you want to know how data gets to the screen, follow this path:
1. **Load:** Next.js renders `page.tsx`.
2. **Fetch:** `page.tsx` calls the RTK Query hook to fetch Page 1 of tasks from the backend.
3. **Normalize:** The raw API data goes through `src/lib/normalize.ts` to clean up bad data (missing IDs, wrong formats).
4. **Store:** The clean data is saved in Redux (`tasksSlice.ts`).
5. **Render:** `TaskList.tsx` reads from Redux and renders the tasks on the screen using Tailwind CSS.
6. **Live Update:** `useTaskFeed.ts` connects to the WebSocket. When a task changes, it updates the Redux store. Because React is connected to Redux, the UI updates instantly!

# Decisions and Tradeoffs

## Architecture & State Management

**RTK Query vs Thunks:** I chose to use RTK Query for fetching the initial paginated list of tasks, combined with a `createEntityAdapter` in a standard slice for maintaining the canonical state. 
- *Tradeoff:* RTK Query is great for caching and deduplication, but managing real-time WebSocket updates that span across multiple paginated queries is complex with `updateQueryData`. By dispatching the RTK Query results into an entity adapter slice, we decouple the data source from the data store. The WebSocket hook can then seamlessly update individual entities in the slice without worrying about which page they belong to.

**Normalization:** The messy API payload is typed strictly using a discriminated union (`Task`). The normalizer uses fallbacks (e.g., generating IDs if missing, falling back to current time for invalid dates) instead of dropping tasks, to ensure the UI remains functional. Unknown string types are preserved in an `originalType` field within an `UnknownTask` type to avoid data loss while maintaining strict typing.

## Security: Rendering Streamed Markdown Safely

The SSE endpoint streams untrusted markdown containing raw HTML and script payloads.
- **Approach:** I used `marked` to parse the markdown into HTML, and immediately piped that raw HTML through `DOMPurify` (`isomorphic-dompurify` to avoid Next.js SSR issues) *before* rendering it with `dangerouslySetInnerHTML`.
- **Why it's safe:** `DOMPurify` strips out all executable scripts, event handlers (like `onerror`), and dangerous tags, while preserving safe HTML structure. This happens entirely in memory before React mounts the node, preventing any XSS execution. 

## Client-Side Persistence (IndexedDB)

I used `localforage` to cache the tasks array on the client side.
- **Caching approach:** For simplicity and speed, the application reads the cached tasks on initialization and dispatches a `hydrateTasks` action to populate the Redux store instantly. 
- **Revalidation:** While rehydrating, the app explicitly skips the RTK Query fetch. Once hydration completes, the RTK Query fetches fresh data from the server, which naturally merges with the Redux entity adapter. This ensures data is instantly available, but strictly temporary until the true server state arrives.

## Handling Edge Cases and Messy Data

- **Pagination & WS events:** If a WebSocket event references a task ID that hasn't been loaded via pagination, the `useTaskFeed` hook explicitly triggers an RTK Query `initiate` fetch for that specific ID. This guarantees the task is added to the store and rendered correctly.
- **Unassigned tasks:** Parsed into `null` and gracefully handled in the UI with an italicized "Unassigned" placeholder.

## TaskTicker Bug Hunt

1. **Stale Closure:** `setTick(tick + 1)` in the interval used a stale closure of `tick = 0`. Fixed by using functional state update: `setTick(prev => prev + 1)`.
2. **Missing Dependency:** `apiBase` was missing from the fetch `useEffect` dependency array.
3. **Null Fetching:** Initial render fired a fetch to `/api/tasks/null`. Fixed by adding an early return `if (!selectedId) return;`.
4. **State Mutation:** `prev.push(t)` directly mutated the state array. Fixed by returning a new array: `return [...prev, t];`.
5. **Race Conditions:** Rapid clicking fired multiple requests that could resolve out of order. Fixed by adding an `ignore` flag in the effect cleanup.
6. **In-place Sort Mutation:** `tasks.sort()` mutates the state array. Fixed by spreading into a new array: `[...tasks].sort()`.
7. **Unstable Keys:** Using the index `i` as the map key causes rendering bugs when sorted. Fixed by using the unique `t.id`.

## Future Improvements

With more time, I would:
- Implement virtualized lists (e.g. `react-virtual`) for the task table to handle thousands of entities gracefully.
- Add robust retry logic and exponential backoff to the WebSocket hook.
- Implement an optimistic UI update for assigning tasks to a user.

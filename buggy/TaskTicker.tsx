// buggy/TaskTicker.tsx 
import React, { useEffect, useState, useRef } from "react"; 
 
type Task = { id: string; title: string; updatedAt: number }; 
 
export function TaskTicker({ apiBase }: { apiBase: string }) { 
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [selectedId, setSelectedId] = useState<string | null>(null); 
  const [tick, setTick] = useState(0); 
 
  // (A) Fix: use functional state update to avoid stale closure
  useEffect(() => { 
    const id = setInterval(() => { 
      setTick(prev => prev + 1); 
    }, 1000); 
    return () => clearInterval(id); 
  }, []); 
 
  // (B) Fix: add apiBase to deps, handle null selectedId, prevent race conditions
  useEffect(() => { 
    if (!selectedId) return;

    let ignore = false;

    fetch(`${apiBase}/api/tasks/${selectedId}`) 
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      }) 
      .then((t) => { 
        if (ignore) return;
        setTasks((prev) => { 
          // Fix: do not mutate state directly, return a new array
          // Also prevent duplicates if clicked multiple times
          if (prev.some(existing => existing.id === t.id)) return prev;
          return [...prev, t];
        }); 
      })
      .catch(err => console.error(err));

    return () => { ignore = true; };
  }, [selectedId, apiBase]); 
 
  // (C) Fix: do not mutate the state array in place with .sort()
  const sorted = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt); 
 
  return ( 
    <ul> 
      {/* Fix: use stable t.id as key instead of index i */}
      {sorted.map((t) => ( 
        <li key={t.id} onClick={() => setSelectedId(t.id)}> 
          {t.title} (updated {Math.floor((Date.now() - t.updatedAt) / 1000)}s ago) 
        </li> 
      ))} 
    </ul> 
  ); 
}

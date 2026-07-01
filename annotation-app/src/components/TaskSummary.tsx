import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export default function TaskSummary({ taskId }: { taskId: string }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setContent('');
    setError(false);
    setIsLoading(true);

    const abortController = new AbortController();
    
    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/tasks/${taskId}/summary`, {
          signal: abortController.signal
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch summary');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) return;

        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === 'end') {
                 setIsLoading(false);
              } else {
                 try {
                   const chunk = JSON.parse(data);
                   setContent(prev => prev + chunk);
                 } catch (e) {
                   console.error('Failed to parse SSE data chunk', e);
                 }
              }
            } else if (line.startsWith('event: done')) {
              // stream complete signal handled in data: end
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummary();
    
    return () => {
      abortController.abort();
    };
  }, [taskId]);

  // Use marked to parse markdown to HTML, then sanitize with DOMPurify
  const rawHtml = marked.parse(content, { async: false }) as string;
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      {error && <div className="text-red-500 mb-2 p-2 bg-red-50 rounded">Error loading summary stream.</div>}
      
      {/* We use dangerouslySetInnerHTML here, but ONLY after passing it through DOMPurify */}
      <div 
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
      />
      
      {isLoading && (
        <div className="mt-4 flex items-center text-blue-600 text-sm animate-pulse font-medium">
          <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mr-2"></div>
          Streaming summary...
        </div>
      )}
    </div>
  );
}

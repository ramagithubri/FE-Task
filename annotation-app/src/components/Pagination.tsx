import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center space-x-2 my-2">
      <button 
        onClick={() => onPageChange(1)} 
        disabled={currentPage === 1}
        className="px-2 py-1 text-gray-400 hover:text-black disabled:opacity-50"
      >
        |&lt;
      </button>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="px-2 py-1 text-gray-400 hover:text-black disabled:opacity-50"
      >
        &lt;
      </button>

      {pages.map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={typeof p !== 'number'}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentPage === p
              ? 'bg-black text-white'
              : typeof p === 'number'
              ? 'text-black hover:bg-gray-100'
              : 'text-gray-500'
          }`}
        >
          {p}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
      >
        &gt;
      </button>
      <button 
        onClick={() => onPageChange(totalPages)} 
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-black hover:bg-gray-100 disabled:opacity-50"
      >
        &gt;|
      </button>
    </div>
  );
}

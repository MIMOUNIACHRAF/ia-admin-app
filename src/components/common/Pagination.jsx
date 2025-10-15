import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex justify-center space-x-2 mt-4">
      {pages.map(page => (
        <button
          key={page}
          className={`px-3 py-1 border rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
}

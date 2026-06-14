import React from 'react';

export default function StatusBadge({ status, onClick }) {
  let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  
  switch (status) {
    case 'Not Assigned':
      colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      break;
    case 'Hotlist':
      colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      break;
    case 'Confirmed List':
      colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      break;
    case 'Not Responding List':
      colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      break;
    case 'Callback List':
      colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      break;
    case 'Rejected List':
      colorClass = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      break;
    default:
      break;
  }

  return (
    <span 
      onClick={onClick}
      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {status}
    </span>
  );
}

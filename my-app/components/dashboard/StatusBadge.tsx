import React from 'react';

interface StatusBadgeProps {
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Pending: 'bg-gray-100 text-gray-800 border-gray-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
        statusStyles[status]
      }`}
    >
      {status}
    </span>
  );
};


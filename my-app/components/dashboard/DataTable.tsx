import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from './StatusBadge';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: TableColumn[];
  data: any[];
  actionButton?: {
    label: string;
    href?: (row: any) => string;
    onClick?: (row: any) => void;
  };
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  actionButton,
}) => {
  return (
    <div className="overflow-x-auto -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-slate-100/50 backdrop-blur-md">
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left py-4 px-4 sm:py-5 sm:px-6 text-xs font-bold text-slate-500 uppercase tracking-widest"
              >
                {column.label}
              </th>
            ))}
            {actionButton && (
              <th className="text-left py-4 px-4 sm:py-5 sm:px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-slate-100/50 backdrop-blur-sm">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="border-b border-slate-100/50 hover:bg-white/80 hover:shadow-sm transition-all duration-300 group"
            >
              {columns.map((column) => (
                <td key={column.key} className="py-3 px-3 sm:py-4 sm:px-6 text-sm whitespace-nowrap">
                  {column.render
                    ? column.render(row[column.key], row)
                    : (
                        <span className={column.key === 'patient' ? 'font-semibold text-gray-900 group-hover:text-blue-700 transition-colors' : 'text-gray-600'}>
                          {row[column.key]}
                        </span>
                      )}
                </td>
              ))}
              {actionButton && (
                <td className="py-3 px-3 sm:py-4 sm:px-6">
                  {actionButton.onClick ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-100 hover:text-blue-700 font-medium touch-manipulation"
                      onClick={() => actionButton.onClick!(row)}
                    >
                      {actionButton.label}
                    </Button>
                  ) : actionButton.href ? (
                    <Link href={actionButton.href(row)}>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100 hover:text-blue-700 font-medium touch-manipulation">
                        {actionButton.label}
                      </Button>
                    </Link>
                  ) : null}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


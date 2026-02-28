import React from 'react';
import { T } from '../backend';

interface OrderStatusBadgeProps {
  status: T;
}

const statusConfig: Record<T, { label: string; className: string }> = {
  [T.pending]: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  },
  [T.processing]: {
    label: 'Processing',
    className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  [T.completed]: {
    label: 'Completed',
    className: 'bg-green-500/20 text-green-400 border border-green-500/30',
  },
  [T.canceled]: {
    label: 'Cancelled',
    className: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  [T.failed]: {
    label: 'Failed',
    className: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  [T.refunded]: {
    label: 'Refunded',
    className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: String(status),
    className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

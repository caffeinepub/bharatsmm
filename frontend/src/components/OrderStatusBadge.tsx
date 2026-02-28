import { T as OrderStatus } from '../backend';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  [OrderStatus.pending]: {
    label: 'Pending',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  [OrderStatus.processing]: {
    label: 'Processing',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  [OrderStatus.completed]: {
    label: 'Completed',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  [OrderStatus.canceled]: {
    label: 'Canceled',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
  [OrderStatus.refunded]: {
    label: 'Refunded',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  [OrderStatus.failed]: {
    label: 'Failed',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: String(status),
    className: 'bg-muted/50 text-muted-foreground border-border/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

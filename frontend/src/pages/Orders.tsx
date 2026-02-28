import { useState, useMemo } from 'react';
import { useListOrdersByUser, useListServices } from '../hooks/useQueries';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ClipboardList } from 'lucide-react';

const PAGE_SIZE = 10;

export default function Orders() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: orders, isLoading: ordersLoading } = useListOrdersByUser();
  const { data: services } = useListServices();

  const serviceMap = useMemo(() => {
    if (!services) return new Map<string, string>();
    return new Map(services.map((s) => [s.id.toString(), s.name]));
  }, [services]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const q = search.toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const serviceName = serviceMap.get(o.service.toString()) ?? '';
      return (
        serviceName.toLowerCase().includes(q) ||
        o.link.toLowerCase().includes(q) ||
        o.id.toString().includes(q)
      );
    });
  }, [orders, search, serviceMap]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage all your SMM orders.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by service, link, or order ID..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-background border-border/50 focus:border-brand"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
        {ordersLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <ClipboardList size={44} className="text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">
              {search ? 'No orders match your search' : 'No orders yet'}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {search ? 'Try a different search term' : 'Place your first order to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Service</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Link</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Qty</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cost</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {paginatedOrders.map((order) => (
                  <tr key={order.id.toString()} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{order.id.toString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {serviceMap.get(order.service.toString()) ?? `Service #${order.service}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px]">
                      <span className="truncate block" title={order.link}>
                        {order.link}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground hidden sm:table-cell">
                      {order.quantity.toString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ₹{order.totalCost.toString()}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

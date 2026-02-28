import React, { useState } from 'react';
import { ClipboardList, AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrdersByUser, useServices } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatCurrency } from '../utils/orderCalculations';

const PAGE_SIZE = 10;

export default function Orders() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading, error } = useOrdersByUser();
  const { data: services } = useServices();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const getServiceName = (serviceId: bigint): string => {
    const service = services?.find((s) => s.id === serviceId);
    return service?.name ?? `Service #${serviceId.toString()}`;
  };

  const formatDate = (timestamp: bigint): string => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to view your orders.
        </p>
      </div>
    );
  }

  const filteredOrders = orders?.filter((o) => {
    if (!search) return true;
    const serviceName = getServiceName(o.service).toLowerCase();
    return (
      serviceName.includes(search.toLowerCase()) ||
      o.link.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search)
    );
  }) ?? [];

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all your SMM orders.
          </p>
        </div>
        {orders && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {orders.length} total orders
          </span>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search orders..."
                className="pl-9 bg-background border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-6 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load orders. Please try again.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ClipboardList className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">
                {search ? 'No orders match your search' : 'No orders yet'}
              </p>
              {!search && (
                <p className="text-sm text-muted-foreground/70">
                  Place your first order to get started!
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs font-medium w-16">ID</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium">Service</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium">Link</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium text-right">Qty</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium text-right">Cost</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-medium">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id.toString()} className="border-border hover:bg-muted/30">
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="text-foreground text-sm font-medium">
                          {getServiceName(order.service)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs max-w-[180px]">
                          <span className="truncate block" title={order.link}>
                            {order.link}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground text-sm text-right">
                          {order.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-foreground text-sm text-right font-medium">
                          {formatCurrency(Number(order.totalCost) / 100)}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-border text-foreground h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-border text-foreground h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

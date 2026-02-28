import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, ClipboardList, Wallet, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBalance, useOrdersByUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatBalance } from '../utils/orderCalculations';
import { T } from '../backend';

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useBalance();
  const { data: orders, isLoading: ordersLoading } = useOrdersByUser();

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to access your dashboard and manage your SMM orders.
        </p>
      </div>
    );
  }

  const pendingOrders = orders?.filter((o) => o.status === T.pending).length ?? 0;
  const processingOrders = orders?.filter((o) => o.status === T.processing).length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === T.completed).length ?? 0;
  const totalOrders = orders?.length ?? 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's your account overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card className="bg-card border-border col-span-1 sm:col-span-2 lg:col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 brand-gradient opacity-10 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-32 bg-muted" />
            ) : balanceError ? (
              <p className="text-destructive text-sm">Error loading balance</p>
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">
                {formatBalance(balance ?? BigInt(0))}
              </p>
            )}
            <Button
              variant="link"
              className="text-brand p-0 h-auto text-xs mt-1"
              onClick={() => navigate({ to: '/add-funds' })}
            >
              Add Funds →
            </Button>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 bg-muted" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">{totalOrders}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Processing */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 bg-muted" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">
                {pendingOrders + processingOrders}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Pending + Processing</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 bg-muted" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground">{completedOrders}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border hover:border-brand/50 transition-colors cursor-pointer group"
          onClick={() => navigate({ to: '/new-order' })}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">Place New Order</h3>
              <p className="text-sm text-muted-foreground">
                Choose a service and boost your social media presence
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-blue-500/50 transition-colors cursor-pointer group"
          onClick={() => navigate({ to: '/orders' })}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">View Orders</h3>
              <p className="text-sm text-muted-foreground">
                Track the status of your existing orders
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {orders && orders.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base font-semibold text-foreground">
              Recent Orders
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-brand hover:text-brand/80 text-xs"
              onClick={() => navigate({ to: '/orders' })}
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id.toString()}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{order.id.toString()}
                    </span>
                    <span className="text-sm text-foreground truncate max-w-[200px]">
                      {order.link}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {order.quantity.toString()} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

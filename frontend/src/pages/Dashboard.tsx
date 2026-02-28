import { Link } from '@tanstack/react-router';
import { PlusCircle, ClipboardList, Wallet, TrendingUp, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useGetBalance, useListOrdersByUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatINR, formatBalance } from '../utils/orderCalculations';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { T as OrderStatus } from '../backend';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { data: orders, isLoading: ordersLoading } = useListOrdersByUser();

  const totalOrders = orders?.length ?? 0;
  const inProgressOrders = orders?.filter(
    (o) => o.status === OrderStatus.pending || o.status === OrderStatus.processing
  ).length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === OrderStatus.completed).length ?? 0;
  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's your account overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-medium">Balance</span>
            <div className="w-9 h-9 rounded-lg bg-brand/20 flex items-center justify-center">
              <Wallet size={18} className="text-brand" />
            </div>
          </div>
          {balanceLoading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {formatBalance(balance ?? BigInt(0))}
            </p>
          )}
          <Link to="/add-funds" className="text-xs text-brand hover:underline mt-1 inline-block">
            Add Funds →
          </Link>
        </div>

        {/* Total Orders */}
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-medium">Total Orders</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-400" />
            </div>
          </div>
          {ordersLoading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          )}
          <Link to="/orders" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
            View All →
          </Link>
        </div>

        {/* In Progress */}
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-medium">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock size={18} className="text-yellow-400" />
            </div>
          </div>
          {ordersLoading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{inProgressOrders}</p>
          )}
          <span className="text-xs text-muted-foreground mt-1 inline-block">Active orders</span>
        </div>

        {/* Completed */}
        <div className="glass-card rounded-xl p-5 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm font-medium">Completed</span>
            <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-400" />
            </div>
          </div>
          {ordersLoading ? (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
          )}
          <span className="text-xs text-muted-foreground mt-1 inline-block">Delivered</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/new-order"
          className="glass-card rounded-xl p-5 border border-border/30 hover:border-brand/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center group-hover:bg-brand/30 transition-colors">
              <PlusCircle size={22} className="text-brand" />
            </div>
            <div>
              <p className="font-semibold text-foreground">New Order</p>
              <p className="text-xs text-muted-foreground">Place a new SMM order</p>
            </div>
          </div>
        </Link>

        <Link
          to="/orders"
          className="glass-card rounded-xl p-5 border border-border/30 hover:border-blue-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <ClipboardList size={22} className="text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">My Orders</p>
              <p className="text-xs text-muted-foreground">Track your orders</p>
            </div>
          </div>
        </Link>

        <Link
          to="/add-funds"
          className="glass-card rounded-xl p-5 border border-border/30 hover:border-green-500/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Wallet size={22} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Add Funds</p>
              <p className="text-xs text-muted-foreground">Top up via UPI</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <h2 className="font-semibold text-foreground font-display">Recent Orders</h2>
          <Link to="/orders" className="text-xs text-brand hover:underline">
            View All
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <TrendingUp size={40} className="text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No orders yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Place your first order to get started
            </p>
            <Link
              to="/new-order"
              className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              Place Order
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {recentOrders.map((order) => (
              <div key={order.id.toString()} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    Order #{order.id.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{order.link}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-foreground">
                    ₹{order.totalCost.toString()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

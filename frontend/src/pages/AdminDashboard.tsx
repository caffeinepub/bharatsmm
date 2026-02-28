import { useState } from 'react';
import { useIsAdmin, useListServices, useUpdateServicePrice, useUpdateOrderStatus, useAddBalance } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { T as OrderStatus } from '../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, AlertTriangle, Save, IndianRupee, Users, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

// Admin-only: fetch all orders via admin access
function useAdminAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['adminAllOrders'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // Admin can list all orders - we use a workaround by listing for each known user
      // Since backend only exposes listOrdersByUser, admin lists their own + approves via updateOrderStatus
      // For a full admin view, we list orders for the admin principal and rely on the admin knowing order IDs
      return actor.listOrdersByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

function AccessDeniedScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-destructive" />
      </div>
      <h2 className="text-xl font-bold font-display text-foreground mb-2">Access Denied</h2>
      <p className="text-muted-foreground max-w-sm">
        You don't have permission to access the Admin Panel. This area is restricted to administrators only.
      </p>
    </div>
  );
}

// Service Prices Tab
function ServicePricesTab() {
  const { data: services, isLoading } = useListServices();
  const { mutateAsync: updatePrice, isPending } = useUpdateServicePrice();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handlePriceChange = (id: string, val: string) => {
    setPrices((prev) => ({ ...prev, [id]: val }));
  };

  const handleSave = async (serviceId: bigint, currentPrice: number) => {
    const idStr = serviceId.toString();
    const newPrice = parseFloat(prices[idStr] ?? currentPrice.toString());
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setSavingId(idStr);
    try {
      await updatePrice({ serviceId, newPrice });
      toast.success('Price updated successfully!');
      setPrices((prev) => { const n = { ...prev }; delete n[idStr]; return n; });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update price');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Edit the price per 1000 units for each service.</p>
      <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Service</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Price/1000 (₹)</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {services?.map((service) => {
                const idStr = service.id.toString();
                const currentVal = prices[idStr] ?? service.pricePer1000.toString();
                const isSaving = savingId === idStr;
                return (
                  <tr key={idStr} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{service.name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{service.category as string}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={currentVal}
                        onChange={(e) => handlePriceChange(idStr, e.target.value)}
                        className="w-28 bg-background border-border/50 focus:border-brand h-8 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        onClick={() => handleSave(service.id, service.pricePer1000)}
                        disabled={isSaving || isPending}
                        className="bg-brand hover:bg-brand/90 text-white h-8 text-xs"
                      >
                        {isSaving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <>
                            <Save size={12} className="mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Order Management Tab
function OrderManagementTab() {
  const { data: orders, isLoading } = useAdminAllOrders();
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [manualOrderId, setManualOrderId] = useState('');
  const [manualStatus, setManualStatus] = useState<OrderStatus>(OrderStatus.processing);

  const handleStatusUpdate = async (orderId: bigint, status: OrderStatus) => {
    const idStr = orderId.toString();
    setUpdatingId(idStr);
    try {
      await updateStatus({ orderId, status });
      toast.success(`Order #${idStr} status updated!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(manualOrderId, 10);
    if (isNaN(id) || id <= 0) {
      toast.error('Please enter a valid order ID');
      return;
    }
    try {
      await updateStatus({ orderId: BigInt(id), status: manualStatus });
      toast.success(`Order #${id} status updated to ${manualStatus}!`);
      setManualOrderId('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Update */}
      <div className="glass-card rounded-xl p-5 border border-border/30 space-y-4">
        <h3 className="font-semibold text-foreground">Update Order Status by ID</h3>
        <form onSubmit={handleManualUpdate} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Order ID</Label>
            <Input
              type="number"
              placeholder="e.g. 42"
              value={manualOrderId}
              onChange={(e) => setManualOrderId(e.target.value)}
              className="w-32 bg-background border-border/50 focus:border-brand h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">New Status</Label>
            <Select value={manualStatus} onValueChange={(v) => setManualStatus(v as OrderStatus)}>
              <SelectTrigger className="w-40 bg-background border-border/50 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isPending || !manualOrderId}
            className="bg-brand hover:bg-brand/90 text-white h-9"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Update'}
          </Button>
        </form>
      </div>

      {/* Orders List */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Your recent orders (admin view):</p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders found</div>
        ) : (
          <div className="glass-card rounded-xl border border-border/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Link</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Qty</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cost</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {orders.map((order) => {
                    const idStr = order.id.toString();
                    const isUpdating = updatingId === idStr;
                    return (
                      <tr key={idStr} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{idStr}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[150px]">
                          <span className="truncate block" title={order.link}>{order.link}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{order.quantity.toString()}</td>
                        <td className="px-4 py-3 text-foreground">₹{order.totalCost.toString()}</td>
                        <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, OrderStatus.processing)}
                              disabled={isUpdating || isPending}
                              className="h-7 text-xs border-border/50 hover:border-brand/50"
                            >
                              {isUpdating ? <Loader2 size={10} className="animate-spin" /> : 'Process'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(order.id, OrderStatus.completed)}
                              disabled={isUpdating || isPending}
                              className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                            >
                              Done
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Approve Top-ups Tab
function ApproveTopupsTab() {
  const { mutateAsync: addBalance, isPending } = useAddBalance();
  const [principalStr, setPrincipalStr] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalStr.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const user = Principal.fromText(principalStr.trim());
      await addBalance({ user, amount: BigInt(amt) });
      toast.success(`₹${amt} credited to ${principalStr.slice(0, 12)}...`);
      setPrincipalStr('');
      setAmount('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add balance');
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        After verifying a UPI payment, manually credit the user's balance by entering their principal ID and amount.
      </p>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border border-border/30 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <IndianRupee size={18} className="text-brand" />
          Credit User Balance
        </h3>

        <div className="space-y-2">
          <Label htmlFor="principal" className="text-foreground font-medium">
            User Principal ID <span className="text-brand">*</span>
          </Label>
          <Input
            id="principal"
            type="text"
            placeholder="e.g. aaaaa-aa or full principal"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            className="bg-background border-border/50 focus:border-brand font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            The user can find their principal ID on their Profile page.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credit-amount" className="text-foreground font-medium">
            Amount (₹) <span className="text-brand">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              id="credit-amount"
              type="number"
              min={1}
              placeholder="Amount to credit"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 bg-background border-border/50 focus:border-brand"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !principalStr || !amount}
          className="bg-brand hover:bg-brand/90 text-white font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Crediting...
            </>
          ) : (
            <>
              <Users size={16} className="mr-2" />
              Credit Balance
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <ShieldCheck size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage orders, balances, and service prices.</p>
        </div>
      </div>

      <Tabs defaultValue="topups">
        <TabsList className="bg-muted/30 border border-border/30">
          <TabsTrigger value="topups" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <IndianRupee size={14} className="mr-1.5" />
            Approve Top-ups
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <ClipboardList size={14} className="mr-1.5" />
            Order Status
          </TabsTrigger>
          <TabsTrigger value="prices" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <IndianRupee size={14} className="mr-1.5" />
            Service Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topups" className="mt-6">
          <ApproveTopupsTab />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrderManagementTab />
        </TabsContent>

        <TabsContent value="prices" className="mt-6">
          <ServicePricesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

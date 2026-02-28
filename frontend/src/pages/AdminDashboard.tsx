import { useState } from 'react';
import {
  useIsAdmin,
  useListServices,
  useUpdateServicePrice,
  useUpdateOrderStatus,
  useAddBalance,
  useAddBalanceToUser,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { T as OrderStatus } from '../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, AlertTriangle, Save, IndianRupee, Users, ClipboardList, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';

// Admin-only: fetch all orders via admin access
function useAdminAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['adminAllOrders'],
    queryFn: async () => {
      if (!actor || !identity) return [];
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
                              className="h-7 text-xs border-border/50 hover:border-green-500/50 hover:text-green-400"
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
function ApproveTopUpsTab() {
  const { mutateAsync: addBalance, isPending } = useAddBalance();
  const [principalInput, setPrincipalInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    let userPrincipal: Principal;
    try {
      userPrincipal = Principal.fromText(principalInput.trim());
    } catch {
      toast.error('Invalid principal ID format');
      return;
    }
    try {
      await addBalance({ user: userPrincipal, amount: BigInt(Math.round(amount * 100)) });
      toast.success(`₹${amount.toFixed(2)} added to user's balance!`);
      setPrincipalInput('');
      setAmountInput('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add balance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 border border-border/30 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <IndianRupee size={16} className="text-brand" />
          <h3 className="font-semibold text-foreground">Approve Top-up Request</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the user's principal ID and the INR amount to credit their account.
        </p>
        <form onSubmit={handleApprove} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">User Principal ID</Label>
            <Input
              type="text"
              placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              className="bg-background border-border/50 focus:border-brand font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Amount (INR ₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 500"
              min="1"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="bg-background border-border/50 focus:border-brand"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !principalInput.trim() || !amountInput}
            className="bg-brand hover:bg-brand/90 text-white w-full"
          >
            {isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Processing...</>
            ) : (
              <><IndianRupee size={14} className="mr-2" />Approve & Credit Balance</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Add Balance Tab
function AddBalanceTab() {
  const { mutateAsync: addBalanceToUser, isPending } = useAddBalanceToUser();
  const [principalInput, setPrincipalInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountInput);
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    let userPrincipal: Principal;
    try {
      userPrincipal = Principal.fromText(principalInput.trim());
    } catch {
      toast.error('Invalid principal ID format');
      return;
    }
    try {
      await addBalanceToUser({ userId: userPrincipal, amount: BigInt(Math.round(amount * 100)) });
      toast.success(`₹${amount.toFixed(2)} successfully added to user's balance!`);
      setPrincipalInput('');
      setAmountInput('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add balance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 border border-border/30 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle size={16} className="text-brand" />
          <h3 className="font-semibold text-foreground">Add Balance to User</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Directly credit an INR amount to any user's account by entering their principal ID.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">User Principal ID</Label>
            <Input
              type="text"
              placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              className="bg-background border-border/50 focus:border-brand font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Amount (INR ₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 100"
              min="1"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="bg-background border-border/50 focus:border-brand"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !principalInput.trim() || !amountInput}
            className="bg-brand hover:bg-brand/90 text-white w-full"
          >
            {isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Adding Balance...</>
            ) : (
              <><PlusCircle size={14} className="mr-2" />Add Balance</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
          <ShieldCheck size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage services, orders, and user balances</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="add-balance" className="space-y-4">
        <TabsList className="bg-muted/30 border border-border/30 p-1 h-auto flex-wrap gap-1">
          <TabsTrigger
            value="add-balance"
            className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm"
          >
            <PlusCircle size={14} className="mr-1.5" />
            Add Balance
          </TabsTrigger>
          <TabsTrigger
            value="approve-topups"
            className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm"
          >
            <IndianRupee size={14} className="mr-1.5" />
            Approve Top-ups
          </TabsTrigger>
          <TabsTrigger
            value="order-status"
            className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm"
          >
            <ClipboardList size={14} className="mr-1.5" />
            Order Status
          </TabsTrigger>
          <TabsTrigger
            value="service-prices"
            className="data-[state=active]:bg-brand data-[state=active]:text-white text-xs sm:text-sm"
          >
            <Users size={14} className="mr-1.5" />
            Service Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-balance">
          <AddBalanceTab />
        </TabsContent>

        <TabsContent value="approve-topups">
          <ApproveTopUpsTab />
        </TabsContent>

        <TabsContent value="order-status">
          <OrderManagementTab />
        </TabsContent>

        <TabsContent value="service-prices">
          <ServicePricesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

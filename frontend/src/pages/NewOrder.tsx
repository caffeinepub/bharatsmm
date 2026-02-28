import { useState, useMemo } from 'react';
import { useListServices, usePlaceOrder, useGetBalance } from '../hooks/useQueries';
import { Category } from '../backend';
import { calculateOrderTotal, formatBalance } from '../utils/orderCalculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS: Record<string, string> = {
  [Category.instagram]: '📸 Instagram',
  [Category.youtube]: '▶️ YouTube',
  [Category.twitterX]: '🐦 Twitter/X',
  [Category.tiktok]: '🎵 TikTok',
  [Category.facebook]: '👥 Facebook',
  [Category.telegram]: '✈️ Telegram',
};

export default function NewOrder() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [successOrderId, setSuccessOrderId] = useState<bigint | null>(null);

  const { data: services, isLoading: servicesLoading } = useListServices();
  const { data: balance } = useGetBalance();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();

  const categories = useMemo(() => {
    if (!services) return [];
    const cats = new Set(services.map((s) => s.category as string));
    return Array.from(cats);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (selectedCategory === 'all') return services;
    return services.filter((s) => (s.category as string) === selectedCategory);
  }, [services, selectedCategory]);

  const selectedService = useMemo(() => {
    if (!services || !selectedServiceId) return null;
    return services.find((s) => s.id.toString() === selectedServiceId) ?? null;
  }, [services, selectedServiceId]);

  const orderTotal = useMemo(() => {
    if (!selectedService || !quantity) return 0;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return 0;
    return calculateOrderTotal(selectedService.pricePer1000, qty);
  }, [selectedService, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < Number(selectedService.minOrder) || qty > Number(selectedService.maxOrder)) {
      toast.error(`Quantity must be between ${selectedService.minOrder} and ${selectedService.maxOrder}`);
      return;
    }
    if (!link.trim()) {
      toast.error('Please enter a link');
      return;
    }
    if (balance !== undefined && orderTotal > Number(balance)) {
      toast.error('Insufficient balance. Please add funds.');
      return;
    }

    try {
      const orderId = await placeOrder({
        service: selectedService.id,
        link: link.trim(),
        quantity: BigInt(qty),
      });
      setSuccessOrderId(orderId);
      setLink('');
      setQuantity('');
      setSelectedServiceId('');
      toast.success(`Order #${orderId} placed successfully!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place order');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">New Order</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose a service and place your SMM order.
        </p>
      </div>

      {/* Balance Info */}
      <div className="glass-card rounded-xl p-4 border border-border/30 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Available Balance</span>
        <span className="font-bold text-foreground text-lg">{formatBalance(balance ?? BigInt(0))}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Category</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setSelectedCategory('all'); setSelectedServiceId(''); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setSelectedCategory(cat); setSelectedServiceId(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand text-white'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Service Select */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            Service <span className="text-brand">*</span>
          </Label>
          {servicesLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading services...
            </div>
          ) : (
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="bg-background border-border/50 focus:border-brand">
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {filteredServices.map((service) => (
                  <SelectItem key={service.id.toString()} value={service.id.toString()}>
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      ₹{service.pricePer1000}/1000 | Min: {service.minOrder.toString()} | Max: {service.maxOrder.toString()}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Service Info */}
        {selectedService && (
          <div className="glass-card rounded-xl p-4 border border-brand/30 space-y-2">
            <p className="text-sm font-semibold text-foreground">{selectedService.name}</p>
            <p className="text-xs text-muted-foreground">{selectedService.description}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-brand font-medium">₹{selectedService.pricePer1000}/1000</span>
              <span className="text-muted-foreground">Min: {selectedService.minOrder.toString()}</span>
              <span className="text-muted-foreground">Max: {selectedService.maxOrder.toString()}</span>
            </div>
          </div>
        )}

        {/* Link */}
        <div className="space-y-2">
          <Label htmlFor="link" className="text-foreground font-medium">
            Link / URL <span className="text-brand">*</span>
          </Label>
          <Input
            id="link"
            type="url"
            placeholder="https://instagram.com/yourprofile"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="bg-background border-border/50 focus:border-brand"
            required
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-foreground font-medium">
            Quantity <span className="text-brand">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            placeholder={
              selectedService
                ? `${selectedService.minOrder} - ${selectedService.maxOrder}`
                : 'Enter quantity'
            }
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={selectedService ? Number(selectedService.minOrder) : 1}
            max={selectedService ? Number(selectedService.maxOrder) : undefined}
            className="bg-background border-border/50 focus:border-brand"
            required
          />
          {selectedService && (
            <p className="text-xs text-muted-foreground">
              Min: {selectedService.minOrder.toString()} — Max: {selectedService.maxOrder.toString()}
            </p>
          )}
        </div>

        {/* Order Total */}
        {orderTotal > 0 && (
          <div className="glass-card rounded-xl p-4 border border-border/30 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order Total</span>
            <span className="text-xl font-bold text-brand">₹{orderTotal}</span>
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {orderTotal > 0 && balance !== undefined && orderTotal > Number(balance) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertCircle size={16} />
            Insufficient balance. Please add funds before placing this order.
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || !selectedServiceId || !link || !quantity}
          className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <ShoppingCart size={16} className="mr-2" />
              Place Order
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

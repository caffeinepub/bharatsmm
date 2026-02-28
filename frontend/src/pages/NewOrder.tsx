import React, { useState, useMemo } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices, usePlaceOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { calculateOrderTotal, formatCurrency, formatBalance } from '../utils/orderCalculations';
import { Category, type T__1 } from '../backend';

const categoryLabels: Record<Category, string> = {
  [Category.instagram]: '📸 Instagram',
  [Category.youtube]: '▶️ YouTube',
  [Category.twitterX]: '🐦 Twitter/X',
  [Category.facebook]: '👥 Facebook',
  [Category.tiktok]: '🎵 TikTok',
  [Category.telegram]: '✈️ Telegram',
};

export default function NewOrder() {
  const { identity } = useInternetIdentity();
  const { data: services, isLoading: servicesLoading } = useServices();
  const placeOrder = usePlaceOrder();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [successOrderId, setSuccessOrderId] = useState<bigint | null>(null);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (selectedCategory === 'all') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const selectedService: T__1 | undefined = useMemo(() => {
    if (!services || !selectedServiceId) return undefined;
    return services.find((s) => s.id.toString() === selectedServiceId);
  }, [services, selectedServiceId]);

  const quantityNum = parseInt(quantity, 10);
  const isValidQuantity =
    selectedService &&
    !isNaN(quantityNum) &&
    quantityNum >= Number(selectedService.minOrder) &&
    quantityNum <= Number(selectedService.maxOrder);

  const orderTotal = selectedService && isValidQuantity
    ? calculateOrderTotal(selectedService.pricePer1000, quantityNum)
    : null;

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedServiceId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !isValidQuantity || !link.trim()) return;

    try {
      const orderId = await placeOrder.mutateAsync({
        service: selectedService.id,
        link: link.trim(),
        quantity: BigInt(quantityNum),
      });
      setSuccessOrderId(orderId);
      setLink('');
      setQuantity('');
      setSelectedServiceId('');
    } catch {
      // error handled via placeOrder.error
    }
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Please log in to place orders.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">New Order</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a service and place your SMM order.
        </p>
      </div>

      {successOrderId && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-medium text-sm">Order placed successfully!</p>
            <p className="text-green-400/70 text-xs">Order ID: #{successOrderId.toString()}</p>
          </div>
          <button
            onClick={() => setSuccessOrderId(null)}
            className="ml-auto text-green-400/50 hover:text-green-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Filter */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">1. Select Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Service Selection */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">2. Select Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
              disabled={servicesLoading}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder={servicesLoading ? 'Loading services...' : 'Choose a service'} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {filteredServices.map((service) => (
                  <SelectItem key={service.id.toString()} value={service.id.toString()}>
                    {service.name} — ₹{(Number(service.pricePer1000) / 100).toFixed(2)}/1000
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedService && (
              <div className="p-3 rounded-lg bg-background border border-border space-y-1.5">
                <p className="text-xs text-muted-foreground">{selectedService.description}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Price: </span>
                    <span className="text-brand font-semibold">
                      {formatCurrency(Number(selectedService.pricePer1000) / 100)}/1000
                    </span>
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Min: </span>
                    {selectedService.minOrder.toString()}
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Max: </span>
                    {selectedService.maxOrder.toString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link & Quantity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">3. Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="link" className="text-foreground text-sm">
                Link / URL <span className="text-brand">*</span>
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="bg-background border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-foreground text-sm">
                Quantity <span className="text-brand">*</span>
                {selectedService && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({selectedService.minOrder.toString()} – {selectedService.maxOrder.toString()})
                  </span>
                )}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min={selectedService ? Number(selectedService.minOrder) : 1}
                max={selectedService ? Number(selectedService.maxOrder) : undefined}
                className="bg-background border-border text-foreground"
                required
              />
              {quantity && selectedService && !isValidQuantity && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Quantity must be between {selectedService.minOrder.toString()} and {selectedService.maxOrder.toString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {orderTotal !== null && (
          <Card className="bg-card border-brand/30 border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="text-2xl font-display font-bold text-brand">
                    {formatCurrency(orderTotal / 100)}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{quantityNum.toLocaleString()} units</p>
                  <p>@ {formatCurrency(Number(selectedService!.pricePer1000) / 100)}/1000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {placeOrder.isError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              {placeOrder.error?.message ?? 'Failed to place order. Please try again.'}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={
            placeOrder.isPending ||
            !selectedService ||
            !isValidQuantity ||
            !link.trim()
          }
          className="w-full brand-gradient text-white hover:opacity-90 font-semibold h-11"
        >
          {placeOrder.isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Placing Order...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Place Order
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Grid3X3, Search, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '../hooks/useQueries';
import { Category, type T__1 } from '../backend';
import { formatCurrency } from '../utils/orderCalculations';

const categoryConfig: Record<Category, { label: string; emoji: string; color: string }> = {
  [Category.instagram]: { label: 'Instagram', emoji: '📸', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  [Category.youtube]: { label: 'YouTube', emoji: '▶️', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  [Category.twitterX]: { label: 'Twitter/X', emoji: '🐦', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  [Category.facebook]: { label: 'Facebook', emoji: '👥', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  [Category.tiktok]: { label: 'TikTok', emoji: '🎵', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  [Category.telegram]: { label: 'Telegram', emoji: '✈️', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

function ServiceCard({ service }: { service: T__1 }) {
  const cat = categoryConfig[service.category];
  return (
    <Card className="bg-card border-border hover:border-brand/40 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-brand transition-colors">
              {service.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {service.description}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border flex-shrink-0 ${cat.color}`}>
            {cat.emoji} {cat.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Price/1000</p>
            <p className="text-sm font-semibold text-brand">
              {formatCurrency(Number(service.pricePer1000) / 100)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Min Order</p>
            <p className="text-sm font-semibold text-foreground">
              {service.minOrder.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Max Order</p>
            <p className="text-sm font-semibold text-foreground">
              {service.maxOrder.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Services() {
  const { data: services, isLoading, error } = useServices();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = services?.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) ?? [];

  const grouped = Object.values(Category).reduce<Record<string, T__1[]>>((acc, cat) => {
    const items = filtered.filter((s) => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Services</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse all available SMM services and pricing.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="pl-9 bg-background border-border text-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'all'
                ? 'brand-gradient text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {Object.entries(categoryConfig).map(([key, { label, emoji }]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === key
                  ? 'brand-gradient text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {services && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-brand" />
          <span>
            <span className="text-foreground font-medium">{filtered.length}</span> services available
          </span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 bg-muted rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-2 p-6 text-destructive">
            <p className="text-sm">Failed to load services. Please try again.</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Grid3X3 className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">No services found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => {
            const config = categoryConfig[cat as Category];
            return (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{config.emoji}</span>
                  <h2 className="font-display font-semibold text-foreground">{config.label}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((service) => (
                    <ServiceCard key={service.id.toString()} service={service} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

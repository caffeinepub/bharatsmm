import { useState, useMemo } from 'react';
import { useListServices } from '../hooks/useQueries';
import { Category } from '../backend';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Layers } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const CATEGORY_LABELS: Record<string, string> = {
  [Category.instagram]: '📸 Instagram',
  [Category.youtube]: '▶️ YouTube',
  [Category.twitterX]: '🐦 Twitter/X',
  [Category.tiktok]: '🎵 TikTok',
  [Category.facebook]: '👥 Facebook',
  [Category.telegram]: '✈️ Telegram',
};

const CATEGORY_COLORS: Record<string, string> = {
  [Category.instagram]: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  [Category.youtube]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [Category.twitterX]: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  [Category.tiktok]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  [Category.facebook]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [Category.telegram]: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: services, isLoading } = useListServices();

  const categories = useMemo(() => {
    if (!services) return [];
    const cats = new Set(services.map((s) => s.category as string));
    return Array.from(cats);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    let result = services;
    if (selectedCategory !== 'all') {
      result = result.filter((s) => (s.category as string) === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [services, selectedCategory, search]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, typeof filteredServices> = {};
    for (const service of filteredServices) {
      const cat = service.category as string;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(service);
    }
    return groups;
  }, [filteredServices]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Services</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse all available social media marketing services.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border/50 focus:border-brand"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
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
              onClick={() => setSelectedCategory(cat)}
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

      {/* Services */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers size={44} className="text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No services found</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedServices).map(([cat, catServices]) => (
            <div key={cat}>
              <h2 className="text-lg font-semibold font-display text-foreground mb-4">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catServices.map((service) => (
                  <div
                    key={service.id.toString()}
                    className="glass-card rounded-xl p-5 border border-border/30 hover:border-brand/40 transition-all duration-200 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-snug">
                        {service.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                          CATEGORY_COLORS[cat] ?? 'bg-muted/50 text-muted-foreground border-border/30'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]?.split(' ')[0] ?? cat}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/20">
                      <div>
                        <p className="text-brand font-bold text-sm">₹{service.pricePer1000}/1000</p>
                        <p className="text-xs text-muted-foreground">
                          {service.minOrder.toString()} – {service.maxOrder.toString()} units
                        </p>
                      </div>
                      <Link
                        to="/new-order"
                        className="px-3 py-1.5 bg-brand/20 text-brand hover:bg-brand hover:text-white rounded-lg text-xs font-medium transition-all"
                      >
                        Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

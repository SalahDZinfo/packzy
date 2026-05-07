import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SavingsBadge } from '@/components/SavingsBadge';
import { trpc } from '@/lib/trpc';
import { ChevronLeft, Filter, X } from 'lucide-react';
import { Link } from 'wouter';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'savings';

export default function BundlesList() {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const bundlesQuery = trpc.bundles.list.useQuery();
  const bundles = bundlesQuery.data || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(bundles.map(b => b.category));
    return Array.from(cats).sort();
  }, [bundles]);

  // Filter and sort bundles
  const filteredBundles = useMemo(() => {
    let filtered = bundles.filter(bundle => {
      const price = parseFloat(bundle.price.toString());
      const matchesCategory = selectedCategory === 'all' || bundle.category === selectedCategory;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesCategory && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
      case 'price-high':
        return filtered.sort((a, b) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()));
      case 'savings':
        return filtered.sort((a, b) => parseFloat(b.savingsAmount.toString()) - parseFloat(a.savingsAmount.toString()));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [bundles, selectedCategory, priceRange, sortBy]);

  const maxPrice = useMemo(() => {
    if (bundles.length === 0) return 1000;
    return Math.max(...bundles.map(b => parseFloat(b.price.toString())));
  }, [bundles]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold">الرئيسية</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">قائمة الباكات</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            الفلاتر
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block md:col-span-1`}
          >
            <Card className="p-6 border-border sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">الفلاتر</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">الفئة</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">جميع الفئات</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">نطاق السعر</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">من</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">إلى</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">الترتيب</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                  <option value="savings">أكبر توفير</option>
                </select>
              </div>
            </Card>
          </div>

          {/* Bundles Grid */}
          <div className="md:col-span-3">
            {bundlesQuery.isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">جاري تحميل الباكات...</p>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد باكات مطابقة للفلاتر المختارة</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  عدد النتائج: {filteredBundles.length}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBundles.map((bundle) => (
                    <Link key={bundle.id} href={`/bundle/${bundle.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition border-border cursor-pointer h-full flex flex-col">
                        {bundle.imageUrl && (
                          <div className="w-full h-48 bg-muted overflow-hidden relative">
                            <img
                              src={bundle.imageUrl}
                              alt={bundle.name}
                              className="w-full h-full object-cover hover:scale-105 transition"
                            />
                            <div className="absolute top-3 right-3">
                              <SavingsBadge
                                amount={parseFloat(bundle.savingsAmount.toString())}
                                percentage={bundle.savingsPercentage}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="font-bold text-foreground mb-1 line-clamp-2">
                            {bundle.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {bundle.category}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                            {bundle.description}
                          </p>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-lg font-bold text-foreground">
                              ${parseFloat(bundle.price.toString()).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${parseFloat(bundle.originalPrice.toString()).toFixed(2)}
                            </span>
                          </div>
                          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
                            عرض التفاصيل
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SavingsBadge } from '@/components/SavingsBadge';
import { trpc } from '@/lib/trpc';
import { ShoppingCart, Zap, Truck, Shield } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const bundlesQuery = trpc.bundles.list.useQuery();

  // Countdown timer for limited time offer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const topBundles = bundlesQuery.data?.slice(0, 4) || [];
  const maxSavings = topBundles.length > 0
    ? Math.max(...topBundles.map(b => parseFloat(b.savingsAmount.toString())))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">PackZy-DZ</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/bundles" className="text-foreground hover:text-accent transition">
              تصفح الباكات
            </Link>
            <Link href="/cart" className="text-foreground hover:text-accent transition">
              السلة
            </Link>
          </nav>
          <Button asChild>
            <Link href="/cart">
              <ShoppingCart className="w-4 h-4 mr-2" />
              السلة
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 md:py-20 border-b border-border">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              اكتشف أفضل الباكات بأسعار لا تُقاوم
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              توفير حقيقي على كل عملية شراء. اختر باكاتك المفضلة واستمتع بخصومات حصرية.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link href="/bundles">
                <Zap className="w-5 h-5 mr-2" />
                ابدأ التسوق الآن
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Limited Time Offer */}
      <section className="bg-accent/5 py-8 border-b border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">عرض محدود الوقت!</h3>
              <p className="text-muted-foreground">
                احصل على أفضل الأسعار قبل انتهاء اليوم
              </p>
            </div>
            <div className="text-2xl font-bold text-accent">
              {timeLeft || 'جاري التحميل...'}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-border">
              <Truck className="w-8 h-8 text-accent mb-4" />
              <h4 className="font-bold text-foreground mb-2">شحن سريع</h4>
              <p className="text-sm text-muted-foreground">
                توصيل آمن وسريع لجميع أنحاء الدولة
              </p>
            </Card>
            <Card className="p-6 border-border">
              <Shield className="w-8 h-8 text-accent mb-4" />
              <h4 className="font-bold text-foreground mb-2">ضمان الجودة</h4>
              <p className="text-sm text-muted-foreground">
                جميع المنتجات أصلية وموثوقة 100%
              </p>
            </Card>
            <Card className="p-6 border-border">
              <Zap className="w-8 h-8 text-accent mb-4" />
              <h4 className="font-bold text-foreground mb-2">توفير مضمون</h4>
              <p className="text-sm text-muted-foreground">
                وفر حتى {maxSavings.toFixed(0)}$ على كل باك
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Bundles */}
      <section className="py-12">
        <div className="container">
          <h3 className="text-3xl font-bold text-foreground mb-8">الباكات المميزة</h3>
          
          {bundlesQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري تحميل الباكات...</p>
            </div>
          ) : topBundles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد باكات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topBundles.map((bundle) => (
                <Link key={bundle.id} href={`/bundle/${bundle.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition border-border cursor-pointer h-full">
                    {bundle.imageUrl && (
                      <div className="w-full h-48 bg-muted overflow-hidden">
                        <img
                          src={bundle.imageUrl}
                          alt={bundle.name}
                          className="w-full h-full object-cover hover:scale-105 transition"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-foreground text-sm line-clamp-2">
                          {bundle.name}
                        </h4>
                        <SavingsBadge
                          amount={parseFloat(bundle.savingsAmount.toString())}
                          percentage={bundle.savingsPercentage}
                          size="sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {bundle.category}
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-12 border-t border-border">
        <div className="container text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            جاهز للتسوق؟
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            اختر من مئات الباكات المميزة واستمتع بأفضل الأسعار والتوفير المضمون
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link href="/bundles">
              تصفح جميع الباكات
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2026 PackZy-DZ. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

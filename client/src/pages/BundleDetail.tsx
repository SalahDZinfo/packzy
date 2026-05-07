import { useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SavingsBadge } from '@/components/SavingsBadge';
import { trpc } from '@/lib/trpc';
import { ChevronLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';

export default function BundleDetail() {
  const { id } = useParams();
  const bundleId = parseInt(id || '0', 10);
  const [quantity, setQuantity] = useState(1);

  const bundleQuery = trpc.bundles.getById.useQuery(bundleId);
  const bundle = bundleQuery.data;

  if (bundleQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">جاري تحميل التفاصيل...</p>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">الباك غير موجود</p>
          <Button asChild>
            <Link href="/bundles">العودة للباكات</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = parseFloat(bundle.price.toString()) * quantity;
  const totalSavings = parseFloat(bundle.savingsAmount.toString()) * quantity;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center gap-4">
          <Link href="/bundles" className="flex items-center gap-2 hover:opacity-70 transition">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold">الباكات</span>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            {bundle.imageUrl && (
              <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                <img
                  src={bundle.imageUrl}
                  alt={bundle.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">الفئة</p>
              <p className="font-semibold text-foreground">{bundle.category}</p>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{bundle.name}</h1>
            
            {bundle.description && (
              <p className="text-muted-foreground mb-6">{bundle.description}</p>
            )}

            {/* Pricing */}
            <Card className="p-6 border-border mb-6 bg-accent/5">
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">السعر</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${parseFloat(bundle.price.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">السعر الأصلي</p>
                  <p className="text-lg text-muted-foreground line-through">
                    ${parseFloat(bundle.originalPrice.toString()).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SavingsBadge
                  amount={parseFloat(bundle.savingsAmount.toString())}
                  percentage={bundle.savingsPercentage}
                  size="lg"
                />
              </div>
            </Card>

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">الكمية</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-border rounded-lg hover:bg-muted transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold text-foreground w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-border rounded-lg hover:bg-muted transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <Card className="p-4 border-border mb-6 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">الإجمالي:</span>
                <span className="text-2xl font-bold text-foreground">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">التوفير الكلي:</span>
                <span className="text-lg font-bold text-accent">
                  ${totalSavings.toFixed(2)}
                </span>
              </div>
            </Card>

            {/* Add to Cart */}
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base mb-4">
              <ShoppingCart className="w-5 h-5 mr-2" />
              أضف إلى السلة
            </Button>
          </div>
        </div>

        {/* Components */}
        {bundle.components && bundle.components.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              مكونات الباك ({bundle.components.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">المنتج</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">السعر الفردي</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">الكمية</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {bundle.components.map((component) => (
                    <tr key={component.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-foreground">{component.name}</p>
                          {component.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {component.description}
                            </p>
                          )}
                          {component.specifications && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {component.specifications}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        ${parseFloat(component.price.toString()).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">{component.quantity}</td>
                      <td className="py-4 px-4 text-right font-semibold text-foreground">
                        ${(parseFloat(component.price.toString()) * component.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Comparison */}
            <Card className="mt-6 p-6 border-border bg-accent/5">
              <h3 className="font-bold text-foreground mb-4">مقارنة السعر</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">سعر شراء القطع منفردة:</span>
                  <span className="font-bold text-foreground">
                    ${parseFloat(bundle.originalPrice.toString()).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">سعر الباك:</span>
                  <span className="font-bold text-foreground">
                    ${parseFloat(bundle.price.toString()).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-muted-foreground">التوفير:</span>
                  <SavingsBadge
                    amount={parseFloat(bundle.savingsAmount.toString())}
                    percentage={bundle.savingsPercentage}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

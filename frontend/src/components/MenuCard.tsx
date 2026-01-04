import { useState } from 'react';
import { Plus, Flame, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, getSpicyLabel } from '@/lib/utils';
import { useCart } from '@/store/cart';
import type { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [spicyLevel, setSpicyLevel] = useState(item.spicyLevel);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(item, quantity, spicyLevel, notes, selectedAddons);
    setIsOpen(false);
    // Reset
    setQuantity(1);
    setSpicyLevel(item.spicyLevel);
    setSelectedAddons([]);
    setNotes('');
  };

  const toggleAddon = (addonId: number) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    let total = item.price * quantity;
    selectedAddons.forEach(addonId => {
      const addon = item.addons.find(a => a.addonId === addonId);
      if (addon) {
        total += addon.addon.price * quantity;
      }
    });
    return total;
  };

  const SpicyIndicator = ({ level, max = 5 }: { level: number; max?: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Flame
          key={i}
          className={`w-4 h-4 ${i < level ? 'text-red-500' : 'text-gray-300'}`}
          fill={i < level ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );

  return (
    <>
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden ${
          !item.isAvailable ? 'opacity-50' : ''
        }`}
        onClick={() => item.isAvailable && setIsOpen(true)}
      >
        <div className="relative h-40 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {item.category.icon || '🍽️'}
          </span>
          {item.isPopular && (
            <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-900">
              <Star className="w-3 h-3 mr-1" fill="currentColor" />
              ยอดนิยม
            </Badge>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-2 px-4">หมด</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
            {item.spicyLevel > 0 && <SpicyIndicator level={item.spicyLevel} />}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-somtum-orange">
              {formatCurrency(item.price)}
            </span>
            <Button 
              size="icon" 
              className="rounded-full w-10 h-10 shadow-lg"
              disabled={!item.isAvailable}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">{item.category.icon}</span>
              {item.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {item.description && (
              <p className="text-muted-foreground">{item.description}</p>
            )}

            {/* Spicy Level Selector */}
            {item.spicyLevel > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">ระดับความเผ็ด</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setSpicyLevel(level)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                        spicyLevel === level
                          ? 'border-somtum-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        {level === 0 ? (
                          <span className="text-sm">❌</span>
                        ) : (
                          <SpicyIndicator level={level} max={level} />
                        )}
                      </div>
                      <span className="text-xs">{getSpicyLabel(level)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">เพิ่มเติม</label>
                <div className="grid grid-cols-2 gap-2">
                  {item.addons.map(({ addon, addonId }) => (
                    <button
                      key={addonId}
                      onClick={() => toggleAddon(addonId)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedAddons.includes(addonId)
                          ? 'border-somtum-orange bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-sm text-somtum-orange">
                        +{formatCurrency(addon.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">หมายเหตุ</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="เช่น ไม่ใส่ผักชี, เพิ่มน้ำปลา..."
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-somtum-orange focus:outline-none resize-none"
                rows={2}
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="font-medium">จำนวน</span>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              size="lg"
              className="w-full text-lg"
              onClick={handleAddToCart}
            >
              เพิ่มลงตะกร้า - {formatCurrency(calculateTotal())}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

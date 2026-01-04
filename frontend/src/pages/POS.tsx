import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuCard } from '@/components/MenuCard';
import { Cart } from '@/components/Cart';
import { CartProvider } from '@/store/cart';
import { menuApi } from '@/services/api';
import type { Category, MenuItem } from '@/types';

function POSContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, itemsData] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems({ available: true }),
      ]);
      setCategories(categoriesData);
      setMenuItems(itemsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId.toString() === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularItems = menuItems.filter(item => item.isPopular);

  return (
    <div className="h-screen flex">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">ขายหน้าร้าน</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 lg:px-6 bg-white border-b">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="flex-shrink-0"
              >
                ทั้งหมด
              </Button>
              <Button
                variant={selectedCategory === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('popular')}
                className="flex-shrink-0"
              >
                ⭐ ยอดนิยม
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className="flex-shrink-0"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Grid */}
        <ScrollArea className="flex-1 p-4 lg:p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : selectedCategory === 'popular' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">ไม่พบเมนูที่ค้นหา</p>
              <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l bg-white hidden lg:block">
        <Cart />
      </div>

      {/* Mobile Cart Button */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <Button size="lg" className="rounded-full w-16 h-16 shadow-xl">
          🛒
        </Button>
      </div>
    </div>
  );
}

export function POS() {
  return (
    <CartProvider>
      <POSContent />
    </CartProvider>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { menuApi } from '@/services/api';
import type { Category, MenuItem, Addon } from '@/types';

export function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    spicyLevel: '0',
    isPopular: false,
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [addonForm, setAddonForm] = useState({ name: '', price: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, itemsData, addonsData] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getItems(),
        menuApi.getAddons(),
      ]);
      setCategories(categoriesData);
      setMenuItems(itemsData);
      setAddons(addonsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Menu Item handlers
  const handleOpenItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        categoryId: item.categoryId.toString(),
        spicyLevel: item.spicyLevel.toString(),
        isPopular: item.isPopular,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id.toString() || '',
        spicyLevel: '0',
        isPopular: false,
      });
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      const data = {
        name: itemForm.name,
        description: itemForm.description || undefined,
        price: parseFloat(itemForm.price),
        categoryId: parseInt(itemForm.categoryId),
        spicyLevel: parseInt(itemForm.spicyLevel),
        isPopular: itemForm.isPopular,
      };

      if (editingItem) {
        await menuApi.updateItem(editingItem.id, data);
      } else {
        await menuApi.createItem(data);
      }

      setIsItemDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('ต้องการลบเมนูนี้?')) return;
    try {
      await menuApi.deleteItem(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      await menuApi.toggleAvailability(id);
      loadData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, icon: category.icon || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', icon: '' });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory.id, categoryForm);
      } else {
        await menuApi.createCategory(categoryForm);
      }
      setIsCategoryDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('ต้องการลบหมวดหมู่นี้?')) return;
    try {
      await menuApi.deleteCategory(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Addon handlers
  const handleOpenAddonDialog = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon);
      setAddonForm({ name: addon.name, price: addon.price.toString() });
    } else {
      setEditingAddon(null);
      setAddonForm({ name: '', price: '' });
    }
    setIsAddonDialogOpen(true);
  };

  const handleSaveAddon = async () => {
    try {
      const data = { name: addonForm.name, price: parseFloat(addonForm.price) };
      if (editingAddon) {
        await menuApi.updateAddon(editingAddon.id, data);
      } else {
        await menuApi.createAddon(data);
      }
      setIsAddonDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save addon:', error);
    }
  };

  const handleDeleteAddon = async (id: number) => {
    if (!confirm('ต้องการลบส่วนเพิ่มนี้?')) return;
    try {
      await menuApi.deleteAddon(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete addon:', error);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.categoryId.toString() === selectedCategory);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการเมนู</h1>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">รายการเมนู</TabsTrigger>
          <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
          <TabsTrigger value="addons">ส่วนเพิ่ม</TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>รายการเมนู ({menuItems.length})</CardTitle>
                <Button onClick={() => handleOpenItemDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มเมนู
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  ทั้งหมด
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id.toString())}
                  >
                    {cat.icon} {cat.name}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        !item.isAvailable ? 'bg-gray-50 opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                          {item.category.icon || '🍽️'}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.isPopular && (
                              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.category.name}
                            {item.spicyLevel > 0 && (
                              <span className="ml-2">
                                {'🌶️'.repeat(item.spicyLevel)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-somtum-orange">
                          {formatCurrency(item.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAvailability(item.id)}
                          >
                            {item.isAvailable ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenItemDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>หมวดหมู่ ({categories.length})</CardTitle>
                <Button onClick={() => handleOpenCategoryDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-4 rounded-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon || '📁'}</span>
                      <div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {cat._count?.menuItems || 0} รายการ
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenCategoryDialog(cat)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addons Tab */}
        <TabsContent value="addons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ส่วนเพิ่ม ({addons.length})</CardTitle>
                <Button onClick={() => handleOpenAddonDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มส่วนเพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addons.map(addon => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-4 rounded-xl border"
                  >
                    <div>
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-somtum-orange font-bold">
                        +{formatCurrency(addon.price)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenAddonDialog(addon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddon(addon.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อเมนู</label>
              <Input
                value={itemForm.name}
                onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="ส้มตำไทย"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">รายละเอียด</label>
              <Input
                value={itemForm.description}
                onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="รายละเอียดเมนู..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ราคา (บาท)</label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="45"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">หมวดหมู่</label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={value => setItemForm({ ...itemForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ระดับความเผ็ด</label>
                <Select
                  value={itemForm.spicyLevel}
                  onValueChange={value => setItemForm({ ...itemForm, spicyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">ไม่เผ็ด</SelectItem>
                    <SelectItem value="1">🌶️ เผ็ดน้อย</SelectItem>
                    <SelectItem value="2">🌶️🌶️ เผ็ดปานกลาง</SelectItem>
                    <SelectItem value="3">🌶️🌶️🌶️ เผ็ด</SelectItem>
                    <SelectItem value="4">🌶️🌶️🌶️🌶️ เผ็ดมาก</SelectItem>
                    <SelectItem value="5">🌶️🌶️🌶️🌶️🌶️ เผ็ดสุดๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ยอดนิยม</label>
                <Button
                  variant={itemForm.isPopular ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setItemForm({ ...itemForm, isPopular: !itemForm.isPopular })}
                >
                  <Star className={`w-4 h-4 mr-2 ${itemForm.isPopular ? 'fill-current' : ''}`} />
                  {itemForm.isPopular ? 'เมนูยอดนิยม' : 'ตั้งเป็นยอดนิยม'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'บันทึก' : 'เพิ่มเมนู'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อหมวดหมู่</label>
              <Input
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="ส้มตำ"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ไอคอน (Emoji)</label>
              <Input
                value={categoryForm.icon}
                onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="🥗"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Addon Dialog */}
      <Dialog open={isAddonDialogOpen} onOpenChange={setIsAddonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddon ? 'แก้ไขส่วนเพิ่ม' : 'เพิ่มส่วนเพิ่มใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อส่วนเพิ่ม</label>
              <Input
                value={addonForm.name}
                onChange={e => setAddonForm({ ...addonForm, name: e.target.value })}
                placeholder="ไข่เค็ม"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ราคา (บาท)</label>
              <Input
                type="number"
                value={addonForm.price}
                onChange={e => setAddonForm({ ...addonForm, price: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddonDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveAddon}>
              {editingAddon ? 'บันทึก' : 'เพิ่มส่วนเพิ่ม'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

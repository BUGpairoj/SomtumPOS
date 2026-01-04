// Local Storage Service for persistent data
import type { Category, MenuItem, Addon, Order, Setting } from '@/types';

const STORAGE_KEYS = {
  CATEGORIES: 'somtum_pos_categories',
  MENU_ITEMS: 'somtum_pos_menu_items',
  ADDONS: 'somtum_pos_addons',
  ORDERS: 'somtum_pos_orders',
  SETTINGS: 'somtum_pos_settings',
};

// Default Categories
const defaultCategories: Category[] = [
  { id: 1, name: 'ส้มตำ', icon: '🥗', sortOrder: 1, isActive: true },
  { id: 2, name: 'ลาบ/น้ำตก', icon: '🍖', sortOrder: 2, isActive: true },
  { id: 3, name: 'ต้ม/แกง', icon: '🍲', sortOrder: 3, isActive: true },
  { id: 4, name: 'ย่าง/ทอด', icon: '🍗', sortOrder: 4, isActive: true },
  { id: 5, name: 'ข้าว', icon: '🍚', sortOrder: 5, isActive: true },
  { id: 6, name: 'เครื่องดื่ม', icon: '🥤', sortOrder: 6, isActive: true },
];

// Default Menu Items
const defaultMenuItems: MenuItem[] = [
  { id: 1, name: 'ส้มตำไทย', description: 'ส้มตำรสชาติดั้งเดิม หวาน เปรี้ยว เค็ม เผ็ด ครบรส', price: 45, image: '🥗', categoryId: 1, category: defaultCategories[0], isAvailable: true, isPopular: true, spicyLevel: 2, addons: [] },
  { id: 2, name: 'ส้มตำปูปลาร้า', description: 'ส้มตำใส่ปูและปลาร้า รสจัดจ้าน', price: 55, image: '🥗', categoryId: 1, category: defaultCategories[0], isAvailable: true, isPopular: true, spicyLevel: 3, addons: [] },
  { id: 3, name: 'ส้มตำปูม้า', description: 'ส้มตำใส่ปูม้าสด เนื้อแน่น', price: 80, image: '🥗', categoryId: 1, category: defaultCategories[0], isAvailable: true, isPopular: false, spicyLevel: 2, addons: [] },
  { id: 4, name: 'ตำข้าวโพด', description: 'ส้มตำข้าวโพดหวาน รสอร่อย', price: 50, image: '🥗', categoryId: 1, category: defaultCategories[0], isAvailable: true, isPopular: false, spicyLevel: 1, addons: [] },
  { id: 5, name: 'ตำแตง', description: 'ส้มตำแตงกรอบ สดชื่น', price: 45, image: '🥗', categoryId: 1, category: defaultCategories[0], isAvailable: true, isPopular: false, spicyLevel: 1, addons: [] },
  { id: 6, name: 'ลาบหมู', description: 'ลาบหมูสับละเอียด รสจัดจ้าน', price: 60, image: '🍖', categoryId: 2, category: defaultCategories[1], isAvailable: true, isPopular: true, spicyLevel: 2, addons: [] },
  { id: 7, name: 'ลาบเป็ด', description: 'ลาบเป็ดเนื้อนุ่ม หอมสมุนไพร', price: 70, image: '🍖', categoryId: 2, category: defaultCategories[1], isAvailable: true, isPopular: false, spicyLevel: 2, addons: [] },
  { id: 8, name: 'น้ำตกหมู', description: 'เนื้อหมูย่างหั่นชิ้น คลุกน้ำยำ', price: 65, image: '🍖', categoryId: 2, category: defaultCategories[1], isAvailable: true, isPopular: true, spicyLevel: 2, addons: [] },
  { id: 9, name: 'น้ำตกเนื้อ', description: 'เนื้อวัวย่างหั่นชิ้น คลุกน้ำยำ', price: 80, image: '🍖', categoryId: 2, category: defaultCategories[1], isAvailable: true, isPopular: false, spicyLevel: 2, addons: [] },
  { id: 10, name: 'ต้มแซ่บกระดูกหมู', description: 'ต้มกระดูกหมูรสแซ่บ น้ำซุปเข้มข้น', price: 70, image: '🍲', categoryId: 3, category: defaultCategories[2], isAvailable: true, isPopular: true, spicyLevel: 2, addons: [] },
  { id: 11, name: 'ต้มยำกุ้ง', description: 'ต้มยำกุ้งน้ำใส รสเปรี้ยวเผ็ด', price: 90, image: '🍲', categoryId: 3, category: defaultCategories[2], isAvailable: true, isPopular: false, spicyLevel: 3, addons: [] },
  { id: 12, name: 'แกงอ่อมหมู', description: 'แกงอ่อมหมูใส่ผักชีลาว หอมสมุนไพร', price: 65, image: '🍲', categoryId: 3, category: defaultCategories[2], isAvailable: true, isPopular: false, spicyLevel: 2, addons: [] },
  { id: 13, name: 'ไก่ย่าง', description: 'ไก่ย่างหมักสมุนไพร หนังกรอบ เนื้อนุ่ม', price: 120, image: '🍗', categoryId: 4, category: defaultCategories[3], isAvailable: true, isPopular: true, spicyLevel: 0, addons: [] },
  { id: 14, name: 'คอหมูย่าง', description: 'คอหมูย่างหมักซอสพิเศษ', price: 80, image: '🍗', categoryId: 4, category: defaultCategories[3], isAvailable: true, isPopular: true, spicyLevel: 0, addons: [] },
  { id: 15, name: 'ปลาดุกย่าง', description: 'ปลาดุกย่างเกลือ เนื้อแน่น', price: 100, image: '🍗', categoryId: 4, category: defaultCategories[3], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 16, name: 'ไส้กรอกอีสาน', description: 'ไส้กรอกหมักข้าวเหนียว รสเปรี้ยว', price: 50, image: '🍗', categoryId: 4, category: defaultCategories[3], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 17, name: 'ข้าวสวย', description: 'ข้าวสวยหอมมะลิ', price: 10, image: '🍚', categoryId: 5, category: defaultCategories[4], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 18, name: 'ข้าวเหนียว', description: 'ข้าวเหนียวนึ่งร้อนๆ', price: 10, image: '🍚', categoryId: 5, category: defaultCategories[4], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 19, name: 'น้ำเปล่า', description: 'น้ำดื่มสะอาด', price: 10, image: '🥤', categoryId: 6, category: defaultCategories[5], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 20, name: 'โค้ก', description: 'น้ำอัดลม', price: 20, image: '🥤', categoryId: 6, category: defaultCategories[5], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 21, name: 'น้ำมะนาว', description: 'น้ำมะนาวสดคั้น เย็นชื่นใจ', price: 25, image: '🥤', categoryId: 6, category: defaultCategories[5], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 22, name: 'ชาเย็น', description: 'ชาไทยเย็น หวานมัน', price: 30, image: '🥤', categoryId: 6, category: defaultCategories[5], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
  { id: 23, name: 'น้ำอัญชัน', description: 'น้ำอัญชันมะนาว สีสวย สดชื่น', price: 30, image: '🥤', categoryId: 6, category: defaultCategories[5], isAvailable: true, isPopular: false, spicyLevel: 0, addons: [] },
];

// Default Addons
const defaultAddons: Addon[] = [
  { id: 1, name: 'ปลาร้า', price: 5, isActive: true },
  { id: 2, name: 'ปูไข่', price: 20, isActive: true },
  { id: 3, name: 'กุ้งสด', price: 30, isActive: true },
  { id: 4, name: 'ไข่เค็ม', price: 10, isActive: true },
  { id: 5, name: 'หมูยอ', price: 15, isActive: true },
  { id: 6, name: 'แคบหมู', price: 15, isActive: true },
];

// Default Settings
const defaultSettings: Setting = {
  id: 1,
  shopName: 'ร้านส้มตำแซ่บนัว',
  address: '123 ถนนอาหารอร่อย กรุงเทพฯ 10110',
  phone: '02-123-4567',
  taxRate: 7,
  receiptFooter: 'ขอบคุณที่มาอุดหนุนครับ/ค่ะ',
};

// Initialize default data
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(defaultMenuItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADDONS)) {
    localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(defaultAddons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
}

// Categories
export function getCategories(): Category[] {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
}

// Menu Items
export function getMenuItems(categoryId?: number, available?: boolean): MenuItem[] {
  initializeData();
  let items: MenuItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU_ITEMS) || '[]');
  
  if (categoryId) {
    items = items.filter(item => item.categoryId === categoryId);
  }
  if (available !== undefined) {
    items = items.filter(item => item.isAvailable === available);
  }
  
  return items;
}

export function getMenuItem(id: number): MenuItem | undefined {
  const items = getMenuItems();
  return items.find(item => item.id === id);
}

export function updateMenuItem(id: number, data: Partial<MenuItem>): MenuItem | undefined {
  const items = getMenuItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...data };
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
    return items[index];
  }
  return undefined;
}

// Addons
export function getAddons(): Addon[] {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADDONS) || '[]');
}

// Orders
export function getOrders(date?: string, status?: string): Order[] {
  initializeData();
  let orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  
  if (date) {
    orders = orders.filter(order => order.createdAt.startsWith(date));
  }
  if (status) {
    orders = orders.filter(order => order.status === status);
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrder(id: number): Order | undefined {
  const orders = getOrders();
  return orders.find(order => order.id === id);
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'payment'>): Order {
  const orders = getOrders();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  const newOrder: Order = {
    ...orderData,
    id: orders.length + 1,
    orderNumber: `ORD-${dateStr}-${randomNum}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    payment: null,
  };
  
  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
}

export function updateOrderStatus(id: number, status: string): Order | undefined {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === id);
  if (index !== -1) {
    orders[index].status = status as OrderStatus;
    orders[index].updatedAt = new Date().toISOString();
    if (status === 'completed') {
      orders[index].completedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
  }
  return undefined;
}

export function updateOrderPayment(id: number, paymentStatus: string, paymentMethod: string): Order | undefined {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === id);
  if (index !== -1) {
    orders[index].paymentStatus = paymentStatus as PaymentStatus;
    orders[index].paymentMethod = paymentMethod;
    orders[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
  }
  return undefined;
}

// Settings
export function getSettings(): Setting {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
}

export function updateSettings(data: Partial<Setting>): Setting {
  const settings = getSettings();
  const updated = { ...settings, ...data };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// Dashboard Stats
export function getDashboardStats(period: string = 'day') {
  const orders = getOrders();
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  const filteredOrders = orders.filter(order => 
    new Date(order.createdAt) >= startDate && order.paymentStatus === 'paid'
  );
  
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  return {
    totalSales,
    totalOrders,
    averageOrder,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    readyOrders: orders.filter(o => o.status === 'ready').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
  };
}

export function getActiveOrders(): Order[] {
  const orders = getOrders();
  return orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  );
}

export function getTopSellingItems(limit: number = 5) {
  const orders = getOrders();
  const itemCounts: Record<number, { menuItem: MenuItem; count: number; revenue: number }> = {};
  
  orders.forEach(order => {
    order.orderItems?.forEach(item => {
      if (!itemCounts[item.menuItemId]) {
        itemCounts[item.menuItemId] = {
          menuItem: item.menuItem,
          count: 0,
          revenue: 0,
        };
      }
      itemCounts[item.menuItemId].count += item.quantity;
      itemCounts[item.menuItemId].revenue += item.totalPrice;
    });
  });
  
  return Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Initialize on load
if (typeof window !== 'undefined') {
  initializeData();
}

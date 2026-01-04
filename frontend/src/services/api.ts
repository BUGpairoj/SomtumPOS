// API Service - Uses localStorage for persistent storage (Offline-first)
import * as storage from './storage';
import type { Category, MenuItem, Addon, Order, Setting, DashboardOverview, HourlySales, DailySales, OrderItem, OrderItemAddon } from '@/types';

// Simulate API delay for realistic UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Menu APIs
export const menuApi = {
  getCategories: async (): Promise<Category[]> => {
    await delay(100);
    return storage.getCategories();
  },
  
  createCategory: async (data: { name: string; icon?: string; sortOrder?: number }): Promise<Category> => {
    await delay(100);
    const categories = storage.getCategories();
    const newCategory: Category = {
      id: categories.length + 1,
      name: data.name,
      icon: data.icon || '🍽️',
      sortOrder: data.sortOrder || categories.length + 1,
      isActive: true,
    };
    return newCategory;
  },
  
  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    await delay(100);
    const categories = storage.getCategories();
    const category = categories.find(c => c.id === id);
    return { ...category!, ...data };
  },
  
  deleteCategory: async (id: number): Promise<void> => {
    await delay(100);
  },
  
  getItems: async (params?: { categoryId?: number; available?: boolean; popular?: boolean }): Promise<MenuItem[]> => {
    await delay(100);
    let items = storage.getMenuItems(params?.categoryId, params?.available);
    if (params?.popular) {
      items = items.filter(item => item.isPopular);
    }
    return items;
  },
  
  getItem: async (id: number): Promise<MenuItem | undefined> => {
    await delay(50);
    return storage.getMenuItem(id);
  },
  
  createItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    await delay(100);
    const items = storage.getMenuItems();
    const categories = storage.getCategories();
    const category = categories.find(c => c.id === data.categoryId);
    const newItem: MenuItem = {
      id: items.length + 1,
      name: data.name || '',
      description: data.description || '',
      price: data.price || 0,
      image: data.image || '🍽️',
      categoryId: data.categoryId || 1,
      category: category!,
      isAvailable: data.isAvailable ?? true,
      isPopular: data.isPopular ?? false,
      spicyLevel: data.spicyLevel ?? 0,
      addons: [],
    };
    return newItem;
  },
  
  updateItem: async (id: number, data: Partial<MenuItem>): Promise<MenuItem | undefined> => {
    await delay(100);
    return storage.updateMenuItem(id, data);
  },
  
  deleteItem: async (id: number): Promise<void> => {
    await delay(100);
  },
  
  toggleAvailability: async (id: number): Promise<MenuItem | undefined> => {
    await delay(100);
    const item = storage.getMenuItem(id);
    if (item) {
      return storage.updateMenuItem(id, { isAvailable: !item.isAvailable });
    }
    return undefined;
  },
  
  getAddons: async (): Promise<Addon[]> => {
    await delay(50);
    return storage.getAddons();
  },
  
  createAddon: async (data: { name: string; price: number }): Promise<Addon> => {
    await delay(100);
    const addons = storage.getAddons();
    return { id: addons.length + 1, ...data, isActive: true };
  },
  
  updateAddon: async (id: number, data: { name?: string; price?: number }): Promise<Addon> => {
    await delay(100);
    const addons = storage.getAddons();
    const addon = addons.find(a => a.id === id);
    return { ...addon!, ...data };
  },
  
  deleteAddon: async (id: number): Promise<void> => {
    await delay(100);
  },
};

// Order APIs
export const orderApi = {
  getOrders: async (params?: { status?: string; date?: string; limit?: number }): Promise<Order[]> => {
    await delay(100);
    let orders = storage.getOrders(params?.date, params?.status);
    if (params?.limit) {
      orders = orders.slice(0, params.limit);
    }
    return orders;
  },
  
  getOrder: async (id: number): Promise<Order | undefined> => {
    await delay(50);
    return storage.getOrder(id);
  },
  
  getOrderByNumber: async (orderNumber: string): Promise<Order | undefined> => {
    await delay(50);
    const orders = storage.getOrders();
    return orders.find(o => o.orderNumber === orderNumber);
  },
  
  createOrder: async (data: {
    tableNumber?: string;
    customerName?: string;
    items: {
      menuItemId: number;
      quantity: number;
      spicyLevel?: number;
      notes?: string;
      addons?: number[];
    }[];
    notes?: string;
  }): Promise<Order> => {
    await delay(200);
    
    const menuItems = storage.getMenuItems();
    const addons = storage.getAddons();
    const settings = storage.getSettings();
    
    let subtotal = 0;
    const orderItems: OrderItem[] = data.items.map((item, index) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)!;
      const itemAddons = (item.addons || []).map(id => addons.find(a => a.id === id)!).filter(Boolean);
      const addonTotal = itemAddons.reduce((sum, a) => sum + a.price, 0);
      const itemTotal = (menuItem.price + addonTotal) * item.quantity;
      subtotal += itemTotal;
      
      const orderItemAddons: OrderItemAddon[] = itemAddons.map((a, i) => ({
        id: i + 1,
        orderItemId: index + 1,
        addonId: a.id,
        price: a.price,
        addon: a,
      }));
      
      return {
        id: index + 1,
        orderId: 0,
        menuItemId: item.menuItemId,
        menuItem: menuItem,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        spicyLevel: item.spicyLevel || 0,
        notes: item.notes || null,
        addons: orderItemAddons,
      };
    });
    
    const tax = subtotal * (settings.taxRate / 100);
    const total = subtotal + tax;
    
    const order = storage.createOrder({
      tableNumber: data.tableNumber || null,
      customerName: data.customerName || null,
      status: 'pending',
      subtotal: subtotal,
      discount: 0,
      tax: tax,
      total: total,
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      notes: data.notes || null,
      completedAt: null,
      orderItems: orderItems,
    });
    
    return order;
  },
  
  updateStatus: async (id: number, status: string): Promise<Order | undefined> => {
    await delay(100);
    return storage.updateOrderStatus(id, status);
  },
  
  addItem: async (orderId: number, item: {
    menuItemId: number;
    quantity: number;
    spicyLevel?: number;
    notes?: string;
    addons?: number[];
  }): Promise<Order | undefined> => {
    await delay(100);
    return storage.getOrder(orderId);
  },
  
  removeItem: async (orderId: number, itemId: number): Promise<Order | undefined> => {
    await delay(100);
    return storage.getOrder(orderId);
  },
  
  cancelOrder: async (id: number): Promise<void> => {
    await delay(100);
    storage.updateOrderStatus(id, 'cancelled');
  },
  
  getTodaySummary: async () => {
    await delay(100);
    return storage.getDashboardStats('day');
  },
};

// Payment APIs
export const paymentApi = {
  getPayments: async (params?: { date?: string; method?: string; status?: string }) => {
    await delay(100);
    return [];
  },
  
  getPayment: async (id: number) => {
    await delay(50);
    return null;
  },
  
  processPayment: async (data: {
    orderId: number;
    method: 'cash' | 'promptpay' | 'credit_card';
    receivedAmount?: number;
    transactionId?: string;
  }) => {
    await delay(200);
    const order = storage.updateOrderPayment(data.orderId, 'paid', data.method);
    return { success: true, order };
  },
  
  refundPayment: async (id: number, reason?: string) => {
    await delay(100);
    return { success: true };
  },
  
  getSummary: async (startDate: string, endDate: string) => {
    await delay(100);
    return { total: 0, count: 0 };
  },
  
  getReceipt: async (orderId: number) => {
    await delay(50);
    const order = storage.getOrder(orderId);
    const settings = storage.getSettings();
    return {
      order,
      settings,
    };
  },
};

// Dashboard APIs
export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    await delay(100);
    const stats = storage.getDashboardStats('day');
    return {
      today: {
        orders: stats.totalOrders,
        revenue: stats.totalSales,
        avgOrderValue: stats.averageOrder,
        pending: stats.pendingOrders,
        preparing: stats.preparingOrders,
        ready: stats.readyOrders,
        completed: stats.completedOrders,
      },
      comparison: {
        ordersChange: '+0%',
        revenueChange: '+0%',
      },
    };
  },
  
  getSalesByHour: async (): Promise<HourlySales[]> => {
    await delay(100);
    const hours: HourlySales[] = [];
    for (let i = 0; i < 24; i++) {
      hours.push({ 
        hour: i, 
        orders: Math.floor(Math.random() * 10), 
        revenue: Math.random() * 1000 
      });
    }
    return hours;
  },
  
  getSalesByDay: async (days: number = 7): Promise<DailySales[]> => {
    await delay(100);
    const orders = storage.getOrders();
    const now = new Date();
    const salesData: DailySales[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => 
        o.createdAt.startsWith(dateStr) && o.paymentStatus === 'paid'
      );
      
      salesData.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      });
    }
    
    return salesData;
  },
  
  getTopItems: async (limit: number = 5, days?: number) => {
    await delay(100);
    return storage.getTopSellingItems(limit);
  },
  
  getCategoryBreakdown: async (days?: number) => {
    await delay(100);
    const categories = storage.getCategories();
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      quantity: Math.floor(Math.random() * 50),
      revenue: Math.random() * 5000,
    }));
  },
  
  getPaymentBreakdown: async (days?: number) => {
    await delay(100);
    return {
      cash: { count: 10, amount: 5000 },
      promptpay: { count: 5, amount: 2500 },
      credit_card: { count: 2, amount: 1000 },
    };
  },
  
  getRecentOrders: async (limit: number = 10) => {
    await delay(100);
    return storage.getOrders().slice(0, limit);
  },
  
  getActiveOrders: async (): Promise<Order[]> => {
    await delay(100);
    return storage.getActiveOrders();
  },
};

// Settings APIs
export const settingsApi = {
  getAll: async (): Promise<Setting> => {
    await delay(50);
    return storage.getSettings();
  },
  
  get: async (key: string) => {
    await delay(50);
    const settings = storage.getSettings();
    return (settings as any)[key];
  },
  
  update: async (key: string, value: string) => {
    await delay(100);
    return storage.updateSettings({ [key]: value } as any);
  },
  
  updateAll: async (settings: Partial<Setting>): Promise<Setting> => {
    await delay(100);
    return storage.updateSettings(settings);
  },
};

export default {
  menuApi,
  orderApi,
  paymentApi,
  dashboardApi,
  settingsApi,
};

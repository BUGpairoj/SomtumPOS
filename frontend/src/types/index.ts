export interface Category {
  id: number;
  name: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    menuItems: number;
  };
}

export interface Addon {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export interface MenuItemAddon {
  id: number;
  menuItemId: number;
  addonId: number;
  addon: Addon;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number;
  isAvailable: boolean;
  isPopular: boolean;
  spicyLevel: number;
  category: Category;
  addons: MenuItemAddon[];
}

export interface OrderItemAddon {
  id: number;
  orderItemId: number;
  addonId: number;
  price: number;
  addon: Addon;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  spicyLevel: number;
  notes: string | null;
  menuItem: MenuItem;
  addons: OrderItemAddon[];
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: 'cash' | 'promptpay' | 'credit_card';
  receivedAmount: number | null;
  changeAmount: number | null;
  transactionId: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  orderItems: OrderItem[];
  payment: Payment | null;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  spicyLevel: number;
  notes: string;
  selectedAddons: number[];
}

export interface DashboardOverview {
  today: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
  };
  comparison: {
    ordersChange: string;
    revenueChange: string;
  };
}

export interface TopItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface CategoryBreakdown {
  id: number;
  name: string;
  icon: string | null;
  quantity: number;
  revenue: number;
}

export interface PaymentBreakdown {
  cash: { count: number; amount: number };
  promptpay: { count: number; amount: number };
  credit_card: { count: number; amount: number };
}

export interface DailySales {
  date: string;
  orders: number;
  revenue: number;
}

export interface HourlySales {
  hour: number;
  orders: number;
  revenue: number;
}

export interface Receipt {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string | null;
  date: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addons: { name: string; price: number }[];
    notes: string | null;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment: {
    method: string;
    receivedAmount: number | null;
    changeAmount: number | null;
    transactionId: string | null;
  } | null;
  footer: string;
}

export interface Settings {
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  tax_rate: string;
  currency: string;
  receipt_footer: string;
}

export interface Setting {
  id: number;
  shopName: string;
  address: string;
  phone: string;
  taxRate: number;
  receiptFooter: string;
}

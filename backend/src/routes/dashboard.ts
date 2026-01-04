import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'cancelled' }
      }
    });
    
    // Yesterday's orders for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: yesterday, lt: today },
        status: { not: 'cancelled' }
      }
    });
    
    const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
    
    const overview = {
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        avgOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0,
        pending: todayOrders.filter(o => o.status === 'pending').length,
        preparing: todayOrders.filter(o => o.status === 'preparing').length,
        ready: todayOrders.filter(o => o.status === 'ready').length,
        completed: todayOrders.filter(o => o.status === 'completed').length
      },
      comparison: {
        ordersChange: yesterdayOrders.length > 0 
          ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
          : 0,
        revenueChange: yesterdayRevenue > 0 
          ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
          : 0
      }
    };
    
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get sales by hour (for today)
router.get('/sales-by-hour', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        paymentStatus: 'paid'
      }
    });
    
    // Group by hour
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: 0,
      revenue: 0
    }));
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders++;
      hourlyData[hour].revenue += order.total;
    });
    
    res.json(hourlyData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hourly sales' });
  }
});

// Get sales by day (last 7 days)
router.get('/sales-by-day', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'paid'
      }
    });
    
    // Group by day
    const dailyData: { [key: string]: { date: string; orders: number; revenue: number } } = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      dailyData[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }
    
    orders.forEach(order => {
      const dateStr = new Date(order.createdAt).toISOString().slice(0, 10);
      if (dailyData[dateStr]) {
        dailyData[dateStr].orders++;
        dailyData[dateStr].revenue += order.total;
      }
    });
    
    res.json(Object.values(dailyData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
});

// Get top selling items
router.get('/top-items', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'cancelled' }
        }
      },
      include: {
        menuItem: {
          include: { category: true }
        }
      }
    });
    
    // Aggregate by menu item
    const itemStats: { [key: number]: { 
      id: number;
      name: string;
      category: string;
      quantity: number;
      revenue: number;
    }} = {};
    
    orderItems.forEach(item => {
      if (!itemStats[item.menuItemId]) {
        itemStats[item.menuItemId] = {
          id: item.menuItemId,
          name: item.menuItem.name,
          category: item.menuItem.category.name,
          quantity: 0,
          revenue: 0
        };
      }
      itemStats[item.menuItemId].quantity += item.quantity;
      itemStats[item.menuItemId].revenue += item.totalPrice;
    });
    
    const topItems = Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
    
    res.json(topItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

// Get category breakdown
router.get('/category-breakdown', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'cancelled' }
        }
      },
      include: {
        menuItem: {
          include: { category: true }
        }
      }
    });
    
    // Aggregate by category
    const categoryStats: { [key: number]: {
      id: number;
      name: string;
      icon: string | null;
      quantity: number;
      revenue: number;
    }} = {};
    
    orderItems.forEach(item => {
      const catId = item.menuItem.categoryId;
      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          id: catId,
          name: item.menuItem.category.name,
          icon: item.menuItem.category.icon,
          quantity: 0,
          revenue: 0
        };
      }
      categoryStats[catId].quantity += item.quantity;
      categoryStats[catId].revenue += item.totalPrice;
    });
    
    res.json(Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

// Get payment method breakdown
router.get('/payment-breakdown', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'completed'
      }
    });
    
    const breakdown = {
      cash: { count: 0, amount: 0 },
      promptpay: { count: 0, amount: 0 },
      credit_card: { count: 0, amount: 0 }
    };
    
    payments.forEach(payment => {
      const method = payment.method as keyof typeof breakdown;
      if (breakdown[method]) {
        breakdown[method].count++;
        breakdown[method].amount += payment.amount;
      }
    });
    
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment breakdown' });
  }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// Get active orders (pending, preparing, ready)
router.get('/active-orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['pending', 'preparing', 'ready'] }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
});

export default router;

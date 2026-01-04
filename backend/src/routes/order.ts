import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const orderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().positive(),
  spicyLevel: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
  addons: z.array(z.number()).optional(),
});

const createOrderSchema = z.object({
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, date, limit } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        },
        payment: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by order number
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        },
        payment: true
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const data = createOrderSchema.parse(req.body);
    
    // Get menu items with prices
    const menuItemIds = data.items.map(item => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } }
    });
    
    const menuItemMap = new Map(menuItems.map(item => [item.id, item]));
    
    // Get addon prices
    const addonIds = data.items.flatMap(item => item.addons || []);
    const addons = await prisma.addon.findMany({
      where: { id: { in: addonIds } }
    });
    const addonMap = new Map(addons.map(addon => [addon.id, addon]));
    
    // Calculate totals
    let subtotal = 0;
    const orderItemsData = data.items.map(item => {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      
      let itemTotal = menuItem.price * item.quantity;
      const addonPrices: { addonId: number; price: number }[] = [];
      
      if (item.addons) {
        for (const addonId of item.addons) {
          const addon = addonMap.get(addonId);
          if (addon) {
            itemTotal += addon.price * item.quantity;
            addonPrices.push({ addonId, price: addon.price });
          }
        }
      }
      
      subtotal += itemTotal;
      
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        spicyLevel: item.spicyLevel || 0,
        notes: item.notes,
        addonPrices
      };
    });
    
    // Get tax rate from settings
    const taxSetting = await prisma.setting.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = taxSetting ? parseFloat(taxSetting.value) / 100 : 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        tableNumber: data.tableNumber,
        customerName: data.customerName,
        subtotal,
        tax,
        total,
        notes: data.notes,
        orderItems: {
          create: orderItemsData.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            spicyLevel: item.spicyLevel,
            notes: item.notes,
            addons: {
              create: item.addonPrices.map(ap => ({
                addonId: ap.addonId,
                price: ap.price
              }))
            }
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        }
      }
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create order', message: (error as Error).message });
    }
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        }
      }
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Add item to order
router.post('/:id/items', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const itemData = orderItemSchema.parse(req.body);
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot modify order that is not pending' });
    }
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemData.menuItemId }
    });
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    let itemTotal = menuItem.price * itemData.quantity;
    const addonPrices: { addonId: number; price: number }[] = [];
    
    if (itemData.addons) {
      const addons = await prisma.addon.findMany({
        where: { id: { in: itemData.addons } }
      });
      for (const addon of addons) {
        itemTotal += addon.price * itemData.quantity;
        addonPrices.push({ addonId: addon.id, price: addon.price });
      }
    }
    
    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: itemData.menuItemId,
        quantity: itemData.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
        spicyLevel: itemData.spicyLevel || 0,
        notes: itemData.notes,
        addons: {
          create: addonPrices.map(ap => ({
            addonId: ap.addonId,
            price: ap.price
          }))
        }
      }
    });
    
    // Recalculate order totals
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxSetting = await prisma.setting.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = taxSetting ? parseFloat(taxSetting.value) / 100 : 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { subtotal, tax, total },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to order' });
  }
});

// Remove item from order
router.delete('/:orderId/items/:itemId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const itemId = parseInt(req.params.itemId);
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot modify order that is not pending' });
    }
    
    await prisma.orderItem.delete({ where: { id: itemId } });
    
    // Recalculate order totals
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId }
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxSetting = await prisma.setting.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = taxSetting ? parseFloat(taxSetting.value) / 100 : 0.07;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { subtotal, tax, total },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            addons: { include: { addon: true } }
          }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from order' });
  }
});

// Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Cannot cancel paid order' });
    }
    
    await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get today's orders summary
router.get('/summary/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'cancelled' }
      }
    });
    
    const summary = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      readyOrders: orders.filter(o => o.status === 'ready').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      unpaidAmount: orders.filter(o => o.paymentStatus === 'unpaid').reduce((sum, o) => sum + o.total, 0)
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;

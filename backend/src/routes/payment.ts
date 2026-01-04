import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const processPaymentSchema = z.object({
  orderId: z.number(),
  method: z.enum(['cash', 'promptpay', 'credit_card']),
  receivedAmount: z.number().optional(),
  transactionId: z.string().optional(),
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { date, method, status } = req.query;
    
    const where: any = {};
    if (method) where.method = method;
    if (status) where.status = status;
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get single payment
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          }
        }
      }
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Process payment
router.post('/process', async (req, res) => {
  try {
    const data = processPaymentSchema.parse(req.body);
    
    const order = await prisma.order.findUnique({
      where: { id: data.orderId }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot pay for cancelled order' });
    }
    
    // Calculate change for cash payment
    let changeAmount = 0;
    if (data.method === 'cash' && data.receivedAmount) {
      if (data.receivedAmount < order.total) {
        return res.status(400).json({ error: 'Insufficient payment amount' });
      }
      changeAmount = data.receivedAmount - order.total;
    }
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: order.total,
        method: data.method,
        receivedAmount: data.receivedAmount,
        changeAmount,
        transactionId: data.transactionId,
        status: 'completed'
      }
    });
    
    // Update order payment status
    await prisma.order.update({
      where: { id: data.orderId },
      data: {
        paymentMethod: data.method,
        paymentStatus: 'paid'
      }
    });
    
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.dailyStat.upsert({
      where: { date: today },
      create: {
        date: today,
        totalOrders: 1,
        totalRevenue: order.total,
        totalItems: 0,
        avgOrderValue: order.total
      },
      update: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: order.total }
      }
    });
    
    const paymentWithOrder = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        order: {
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          }
        }
      }
    });
    
    res.status(201).json(paymentWithOrder);
  } catch (error) {
    console.error('Payment error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;
    
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    if (payment.status === 'refunded') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id },
      data: { status: 'refunded' }
    });
    
    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'refunded',
        status: 'cancelled'
      }
    });
    
    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.dailyStat.update({
      where: { date: today },
      data: {
        totalOrders: { decrement: 1 },
        totalRevenue: { decrement: payment.amount }
      }
    }).catch(() => {}); // Ignore if no stat exists
    
    res.json({ success: true, message: 'Payment refunded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refund payment' });
  }
});

// Get payment summary for a date range
router.get('/summary/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'completed'
      }
    });
    
    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byMethod: {
        cash: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
        promptpay: payments.filter(p => p.method === 'promptpay').reduce((sum, p) => sum + p.amount, 0),
        credit_card: payments.filter(p => p.method === 'credit_card').reduce((sum, p) => sum + p.amount, 0)
      },
      countByMethod: {
        cash: payments.filter(p => p.method === 'cash').length,
        promptpay: payments.filter(p => p.method === 'promptpay').length,
        credit_card: payments.filter(p => p.method === 'credit_card').length
      }
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

// Generate receipt data
router.get('/receipt/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
    
    // Get shop settings
    const settings = await prisma.setting.findMany();
    const settingsMap = new Map(settings.map(s => [s.key, s.value]));
    
    const receipt = {
      shopName: settingsMap.get('shop_name') || 'ร้านส้มตำแซ่บนัว',
      shopAddress: settingsMap.get('shop_address') || '',
      shopPhone: settingsMap.get('shop_phone') || '',
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      date: order.createdAt,
      items: order.orderItems.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        addons: item.addons.map(a => ({
          name: a.addon.name,
          price: a.price
        })),
        notes: item.notes
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      payment: order.payment ? {
        method: order.payment.method,
        receivedAmount: order.payment.receivedAmount,
        changeAmount: order.payment.changeAmount,
        transactionId: order.payment.transactionId
      } : null,
      footer: settingsMap.get('receipt_footer') || 'ขอบคุณที่มาอุดหนุนครับ/ค่ะ'
    };
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
});

const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  image: z.string().optional(),
  categoryId: z.number(),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  spicyLevel: z.number().min(0).max(5).optional(),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

// ==================== Categories ====================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { menuItems: true } }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = createCategorySchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { id },
      data
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== Menu Items ====================

// Get all menu items
router.get('/items', async (req, res) => {
  try {
    const { categoryId, available, popular } = req.query;
    
    const where: any = {};
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (available === 'true') where.isAvailable = true;
    if (popular === 'true') where.isPopular = true;

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        addons: {
          include: { addon: true }
        }
      },
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' }
      ]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get single menu item
router.get('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        addons: {
          include: { addon: true }
        }
      }
    });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item
router.post('/items', async (req, res) => {
  try {
    const data = createMenuItemSchema.parse(req.body);
    const item = await prisma.menuItem.create({
      data,
      include: { category: true }
    });
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }
});

// Update menu item
router.put('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = updateMenuItemSchema.parse(req.body);
    const item = await prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.menuItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Toggle availability
router.patch('/items/:id/availability', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// ==================== Addons ====================

// Get all addons
router.get('/addons', async (req, res) => {
  try {
    const addons = await prisma.addon.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

// Create addon
router.post('/addons', async (req, res) => {
  try {
    const { name, price } = req.body;
    const addon = await prisma.addon.create({
      data: { name, price }
    });
    res.status(201).json(addon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create addon' });
  }
});

// Update addon
router.put('/addons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;
    const addon = await prisma.addon.update({
      where: { id },
      data: { name, price }
    });
    res.json(addon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update addon' });
  }
});

// Delete addon
router.delete('/addons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.addon.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete addon' });
  }
});

export default router;

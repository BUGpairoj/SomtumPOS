import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: { [key: string]: string } = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get single setting
router.get('/:key', async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: req.params.key }
    });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update or create setting
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key: req.params.key },
      update: { value },
      create: { key: req.params.key, value }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Update multiple settings
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    const results = await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: value as string },
          create: { key, value: value as string }
        })
      )
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  try {
    await prisma.setting.delete({
      where: { key: req.params.key }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

export default router;

import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

const brandSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  country: Joi.string().max(80).allow(null, ''),
});

// GET all panel brands
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, country, created_at FROM panel_brands ORDER BY name ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load panel brands' });
  }
});

// POST create brand
router.post('/', async (req, res) => {
  const { error } = brandSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { name, country } = req.body;
    const [result] = await pool.query(
      'INSERT INTO panel_brands (name, country) VALUES (?, ?)',
      [name.trim(), country?.trim() || null]
    );
    res.status(201).json({ success: true, message: 'Panel brand created', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create panel brand' });
  }
});

// PUT update brand
router.put('/:id', async (req, res) => {
  const { error } = brandSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const { name, country } = req.body;
    const [result] = await pool.query(
      'UPDATE panel_brands SET name = ?, country = ? WHERE id = ?',
      [name.trim(), country?.trim() || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Panel brand updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update panel brand' });
  }
});

// DELETE = soft delete (optional - if you add is_active column later)
router.delete('/:id', async (req, res) => {
  res.status(501).json({ success: false, message: 'Delete not implemented yet (add is_active column if needed)' });
});

export default router;
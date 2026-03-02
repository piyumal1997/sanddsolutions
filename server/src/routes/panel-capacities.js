import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

const capacitySchema = Joi.object({
  wattage: Joi.number().integer().min(100).max(1000).required().messages({
    'number.base': 'Wattage must be a number',
    'number.min': 'Wattage must be at least 100W',
    'number.max': 'Wattage cannot exceed 1000W',
    'any.required': 'Wattage is required',
  }),
  description: Joi.string().max(150).allow(null, ''),
  is_active: Joi.number().valid(0, 1).default(1),
});

// GET all panel capacities (active only by default)
router.get('/', async (req, res) => {
  try {
    const showInactive = req.query.showInactive === 'true';
    const where = showInactive ? '' : 'WHERE is_active = 1';

    const [rows] = await pool.query(
      `SELECT id, wattage, description, created_at, updated_at
       FROM panel_capacities
       ${where}
       ORDER BY wattage ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /panel-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load panel capacities' });
  }
});

// POST create new panel capacity
router.post('/', async (req, res) => {
  const { error } = capacitySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { wattage, description } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM panel_capacities WHERE wattage = ?',
      [wattage]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Panel capacity with this wattage already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO panel_capacities (wattage, description) VALUES (?, ?)',
      [wattage, description?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Panel capacity created successfully',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('POST /panel-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create panel capacity', error: err.message });
  }
});

// PUT update panel capacity
router.put('/:id', async (req, res) => {
  const { error } = capacitySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const { wattage, description, is_active } = req.body;

    const [result] = await pool.query(
      `UPDATE panel_capacities 
       SET wattage = ?, description = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [wattage, description?.trim() || null, is_active ?? 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Panel capacity not found' });
    }

    res.json({ success: true, message: 'Panel capacity updated successfully' });
  } catch (err) {
    console.error('PUT /panel-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update panel capacity', error: err.message });
  }
});

// DELETE = soft delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE panel_capacities SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Panel capacity not found' });
    }

    res.json({ success: true, message: 'Panel capacity deactivated successfully' });
  } catch (err) {
    console.error('DELETE /panel-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to deactivate panel capacity' });
  }
});

export default router;
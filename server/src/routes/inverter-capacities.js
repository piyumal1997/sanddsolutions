import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

const capacitySchema = Joi.object({
  capacity_kw: Joi.number().precision(2).min(0.5).max(100).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be at least 0.5 kW',
    'number.max': 'Capacity cannot exceed 100 kW',
    'any.required': 'Capacity (kW) is required',
  }),
  type: Joi.string().valid('string', 'hybrid', 'micro', 'off-grid').required(),
  description: Joi.string().max(150).allow(null, ''),
  is_active: Joi.number().valid(0, 1).default(1),
});

// GET all inverter capacities
router.get('/', async (req, res) => {
  try {
    const showInactive = req.query.showInactive === 'true';
    const where = showInactive ? '' : 'WHERE is_active = 1';

    const [rows] = await pool.query(
      `SELECT id, capacity_kw, type, description, created_at, updated_at
       FROM inverter_capacities
       ${where}
       ORDER BY capacity_kw ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /inverter-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load inverter capacities' });
  }
});

// POST create inverter capacity
router.post('/', async (req, res) => {
  const { error } = capacitySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { capacity_kw, type, description } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM inverter_capacities WHERE capacity_kw = ? AND type = ?',
      [capacity_kw, type]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Inverter capacity with this kW and type already exists',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO inverter_capacities (capacity_kw, type, description) VALUES (?, ?, ?)',
      [capacity_kw, type, description?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Inverter capacity created successfully',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('POST /inverter-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create inverter capacity', error: err.message });
  }
});

// PUT update inverter capacity
router.put('/:id', async (req, res) => {
  const { error } = capacitySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const { capacity_kw, type, description, is_active } = req.body;

    const [result] = await pool.query(
      `UPDATE inverter_capacities 
       SET capacity_kw = ?, type = ?, description = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [capacity_kw, type, description?.trim() || null, is_active ?? 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Inverter capacity not found' });
    }

    res.json({ success: true, message: 'Inverter capacity updated successfully' });
  } catch (err) {
    console.error('PUT /inverter-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update inverter capacity', error: err.message });
  }
});

// DELETE = soft delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE inverter_capacities SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Inverter capacity not found' });
    }

    res.json({ success: true, message: 'Inverter capacity deactivated successfully' });
  } catch (err) {
    console.error('DELETE /inverter-capacities error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to deactivate inverter capacity' });
  }
});

export default router;
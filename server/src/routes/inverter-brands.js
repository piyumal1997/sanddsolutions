// server/src/routes/inverter-brands.js
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

// GET all inverter brands
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, country, created_at FROM inverter_brands ORDER BY name ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /inverter-brands error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load inverter brands',
      error: err.message,
    });
  }
});

// POST create inverter brand
router.post('/', async (req, res) => {
  const { error } = brandSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const { name, country } = req.body;

    // Prevent duplicate name
    const [existing] = await pool.query(
      'SELECT id FROM inverter_brands WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Inverter brand with this name already exists',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO inverter_brands (name, country) VALUES (?, ?)',
      [name.trim(), country?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Inverter brand created successfully',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('POST /inverter-brands error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create inverter brand',
      error: err.message,
    });
  }
});

// PUT update inverter brand
router.put('/:id', async (req, res) => {
  const { error } = brandSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const { name, country } = req.body;

    const [result] = await pool.query(
      'UPDATE inverter_brands SET name = ?, country = ?, updated_at = NOW() WHERE id = ?',
      [name.trim(), country?.trim() || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inverter brand not found',
      });
    }

    res.json({
      success: true,
      message: 'Inverter brand updated successfully',
    });
  } catch (err) {
    console.error('PUT /inverter-brands error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update inverter brand',
      error: err.message,
    });
  }
});

// DELETE – hard delete (permanent removal)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM inverter_brands WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inverter brand not found',
      });
    }

    res.json({
      success: true,
      message: 'Inverter brand deleted successfully',
    });
  } catch (err) {
    console.error('DELETE /inverter-brands error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inverter brand',
      error: err.message,
    });
  }
});

export default router;
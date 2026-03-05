// server/src/routes/batteries.js
import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

// All routes require authentication and admin/manager role
router.use(protect);
router.use(restrictTo('admin', 'manager'));

// Validation schema for battery
const batterySchema = Joi.object({
  brand: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Brand must be a string',
    'string.min': 'Brand name must be at least 2 characters',
    'string.max': 'Brand name cannot exceed 100 characters',
    'any.required': 'Brand is required',
  }),
  capacity_kwh: Joi.number().precision(2).min(0.5).max(200).required().messages({
    'number.base': 'Capacity must be a number',
    'number.min': 'Capacity must be at least 0.5 kWh',
    'number.max': 'Capacity cannot exceed 200 kWh',
    'any.required': 'Capacity (kWh) is required',
  }),
  price_lkr: Joi.number().precision(2).min(10000).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be at least 10,000 LKR',
    'any.required': 'Price (LKR) is required',
  }),
  description: Joi.string().max(250).allow(null, ''),
});

// GET all batteries
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         id, 
         brand, 
         capacity_kwh, 
         price_lkr, 
         description, 
         created_at, 
         updated_at 
       FROM solar_batteries 
       ORDER BY brand ASC, capacity_kwh ASC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('GET /batteries error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load batteries',
      error: err.message,
    });
  }
});

// POST create new battery
router.post('/', async (req, res) => {
  const { error } = batterySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const { brand, capacity_kwh, price_lkr, description } = req.body;

    // Optional: prevent duplicate brand + capacity combination
    const [existing] = await pool.query(
      'SELECT id FROM solar_batteries WHERE brand = ? AND capacity_kwh = ?',
      [brand.trim(), capacity_kwh]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Battery with this brand and capacity already exists',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO solar_batteries 
       (brand, capacity_kwh, price_lkr, description) 
       VALUES (?, ?, ?, ?)`,
      [
        brand.trim(),
        capacity_kwh,
        price_lkr,
        description?.trim() || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Battery added successfully',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('POST /batteries error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add battery',
      error: err.message,
    });
  }
});

// PUT update battery
router.put('/:id', async (req, res) => {
  const { error } = batterySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const { brand, capacity_kwh, price_lkr, description } = req.body;

    const [result] = await pool.query(
      `UPDATE solar_batteries 
       SET brand = ?, 
           capacity_kwh = ?, 
           price_lkr = ?, 
           description = ?, 
           updated_at = NOW()
       WHERE id = ?`,
      [
        brand.trim(),
        capacity_kwh,
        price_lkr,
        description?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Battery not found',
      });
    }

    res.json({
      success: true,
      message: 'Battery updated successfully',
    });
  } catch (err) {
    console.error('PUT /batteries error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update battery',
      error: err.message,
    });
  }
});

// DELETE – hard delete (permanent)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM solar_batteries WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Battery not found',
      });
    }

    res.json({
      success: true,
      message: 'Battery deleted successfully',
    });
  } catch (err) {
    console.error('DELETE /batteries error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete battery',
      error: err.message,
    });
  }
});

export default router;
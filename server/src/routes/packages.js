import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

const packageSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  panel_brand_id: Joi.number().integer().required(),
  panel_capacity_id: Joi.number().integer().required(),
  panel_count: Joi.number().integer().min(1).required(),
  inverter_brand_id: Joi.number().integer().required(),
  inverter_capacity_id: Joi.number().integer().required(),
  full_price_lkr: Joi.number().positive().precision(2).required(),
  description: Joi.string().allow('').max(1000),
  is_active: Joi.number().valid(0, 1).default(1),
});

// GET all packages (active only by default)
router.get('/', async (req, res) => {
  try {
    const showInactive = req.query.showInactive === 'true';
    const where = showInactive ? '' : 'WHERE sp.is_active = 1';

    const [rows] = await pool.query(
      `SELECT sp.*, 
              pb.name AS panel_brand_name, pc.wattage AS panel_wattage,
              ib.name AS inverter_brand_name, ic.capacity_kw AS inverter_capacity_kw,
              ic.type AS inverter_type
       FROM solar_packages sp
       LEFT JOIN panel_brands pb ON sp.panel_brand_id = pb.id
       LEFT JOIN panel_capacities pc ON sp.panel_capacity_id = pc.id
       LEFT JOIN inverter_brands ib ON sp.inverter_brand_id = ib.id
       LEFT JOIN inverter_capacities ic ON sp.inverter_capacity_id = ic.id
       ${where}
       ORDER BY sp.created_at DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /packages error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load packages' });
  }
});

// POST create new package
router.post('/', async (req, res) => {
  const { error } = packageSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const {
      name, panel_brand_id, panel_capacity_id, panel_count,
      inverter_brand_id, inverter_capacity_id, full_price_lkr, description
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO solar_packages 
       (name, panel_brand_id, panel_capacity_id, panel_count, 
        inverter_brand_id, inverter_capacity_id, full_price_lkr, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name.trim(), panel_brand_id, panel_capacity_id, panel_count,
       inverter_brand_id, inverter_capacity_id, full_price_lkr, description?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: 'Solar package created successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error('POST /packages error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create package', error: err.message });
  }
});

// PUT update package
router.put('/:id', async (req, res) => {
  const { error } = packageSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const {
      name, panel_brand_id, panel_capacity_id, panel_count,
      inverter_brand_id, inverter_capacity_id, full_price_lkr, description, is_active
    } = req.body;

    const [result] = await pool.query(
      `UPDATE solar_packages 
       SET name = ?, panel_brand_id = ?, panel_capacity_id = ?, panel_count = ?,
           inverter_brand_id = ?, inverter_capacity_id = ?, full_price_lkr = ?,
           description = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name.trim(), panel_brand_id, panel_capacity_id, panel_count,
       inverter_brand_id, inverter_capacity_id, full_price_lkr,
       description?.trim() || null, is_active ?? 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({ success: true, message: 'Package updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update package', error: err.message });
  }
});

// DELETE = soft delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      'UPDATE solar_packages SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({ success: true, message: 'Package deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to deactivate package' });
  }
});

export default router;
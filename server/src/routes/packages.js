// server/src/routes/packages.js
import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

const packageSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  package_type: Joi.string().valid('On-Grid', 'Off-Grid', 'Hybrid').required(),
  panel_brand_id: Joi.number().integer().required(),
  panel_capacity_id: Joi.number().integer().required(),
  panel_count: Joi.number().integer().min(1).required(),
  inverter_brand_id: Joi.number().integer().required(),
  inverter_capacity_id: Joi.number().integer().required(),
  battery_id: Joi.number().integer().allow(null),
  full_price_lkr: Joi.number().precision(2).min(0).required(),
  description: Joi.string().allow(null, ''),
});

// GET all active packages with joined data
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id, p.name, p.package_type,
        p.panel_brand_id, p.panel_capacity_id, p.panel_count,
        p.inverter_brand_id, p.inverter_capacity_id, p.battery_id,
        p.full_price_lkr, p.description, p.created_at, p.updated_at,
        pb.name AS panel_brand_name,
        pc.wattage AS panel_wattage,
        ib.name AS inverter_brand_name,
        ic.capacity_kw AS inverter_capacity_kw,
        ic.type AS inverter_type,
        sb.brand AS battery_brand,
        sb.capacity_kwh AS battery_capacity_kwh,
        sb.price_lkr AS battery_price_lkr
      FROM solar_packages p
      LEFT JOIN panel_brands pb ON p.panel_brand_id = pb.id
      LEFT JOIN panel_capacities pc ON p.panel_capacity_id = pc.id
      LEFT JOIN inverter_brands ib ON p.inverter_brand_id = ib.id
      LEFT JOIN inverter_capacities ic ON p.inverter_capacity_id = ic.id
      LEFT JOIN solar_batteries sb ON p.battery_id = sb.id
      ORDER BY p.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /packages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load packages',
      error: err.message,
    });
  }
});

// POST create new package
router.post('/', async (req, res) => {
  const { error } = packageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const {
    name, package_type, panel_brand_id, panel_capacity_id, panel_count,
    inverter_brand_id, inverter_capacity_id, battery_id, full_price_lkr, description
  } = req.body;

  // Business rule validation
  if (package_type === 'On-Grid' && battery_id) {
    return res.status(400).json({
      success: false,
      message: 'On-Grid packages cannot have a battery',
    });
  }

  if (['Off-Grid', 'Hybrid'].includes(package_type) && !battery_id) {
    return res.status(400).json({
      success: false,
      message: 'Battery is required for Off-Grid or Hybrid packages',
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO solar_packages 
       (name, package_type, panel_brand_id, panel_capacity_id, panel_count,
        inverter_brand_id, inverter_capacity_id, battery_id, full_price_lkr, description,
        created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        package_type,
        panel_brand_id,
        panel_capacity_id,
        panel_count,
        inverter_brand_id,
        inverter_capacity_id,
        battery_id || null,
        full_price_lkr,
        description?.trim() || null,
        req.user.id, // assuming protect middleware sets req.user
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('POST /packages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: err.message,
    });
  }
});

// PUT update package
router.put('/:id', async (req, res) => {
  const { error } = packageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { id } = req.params;
  const {
    name, package_type, panel_brand_id, panel_capacity_id, panel_count,
    inverter_brand_id, inverter_capacity_id, battery_id, full_price_lkr, description
  } = req.body;

  // Same business rule validation
  if (package_type === 'On-Grid' && battery_id) {
    return res.status(400).json({
      success: false,
      message: 'On-Grid packages cannot have a battery',
    });
  }

  if (['Off-Grid', 'Hybrid'].includes(package_type) && !battery_id) {
    return res.status(400).json({
      success: false,
      message: 'Battery is required for Off-Grid or Hybrid packages',
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE solar_packages 
       SET name = ?, package_type = ?, panel_brand_id = ?, panel_capacity_id = ?,
           panel_count = ?, inverter_brand_id = ?, inverter_capacity_id = ?,
           battery_id = ?, full_price_lkr = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name.trim(),
        package_type,
        panel_brand_id,
        panel_capacity_id,
        panel_count,
        inverter_brand_id,
        inverter_capacity_id,
        battery_id || null,
        full_price_lkr,
        description?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
    });
  } catch (err) {
    console.error('PUT /packages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: err.message,
    });
  }
});

// DELETE – hard delete (permanent removal)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM solar_packages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (err) {
    console.error('DELETE /packages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: err.message,
    });
  }
});

export default router;
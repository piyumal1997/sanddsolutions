// server/src/routes/dashboard.js
import express from 'express';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'manager'));

// GET /api/dashboard – stats for dashboard
router.get('/', async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT COUNT(id) AS total FROM projects');
    const [packages] = await pool.query('SELECT COUNT(id) AS total FROM solar_packages');
    const [inquiries] = await pool.query('SELECT COUNT(id) AS total FROM inquiries');
    const [activeUsers] = await pool.query('SELECT COUNT(id) AS total FROM users WHERE is_active = 1');

    const stats = {
      projects: projects[0].total,
      packages: packages[0].total,
      inquiries: inquiries[0].total,
      activeUsers: activeUsers[0].total,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('GET /dashboard error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats',
      error: err.message,
    });
  }
});

export default router;
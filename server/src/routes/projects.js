// server/src/routes/projects.js
import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ────────────────────────────────────────────────
// Multer setup for file uploads
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, gif) and mp4 videos are allowed'));
  },
});

// ────────────────────────────────────────────────
// GET /api/projects
// Public endpoint – returns all projects for frontend display
// ────────────────────────────────────────────────
// Supports ?type=industrial-solar & ?search=solar (both optional)
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT id, title, description, type, date, details, images FROM projects WHERE 1=1';
    const params = [];

    // Type filter
    if (req.query.type && req.query.type !== 'all') {
      query += ' AND type = ?';
      params.push(req.query.type);
    }

    // Search filter (title OR description)
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = `%${req.query.search.trim()}%`;
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);

    // Optional: convert image paths to absolute URLs
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://sanddsolutions.lk'
      : 'http://localhost:3000';

    const projects = rows.map(project => ({
      ...project,
      images: project.images
        ? JSON.parse(project.images).map(img =>
            img.startsWith('http') ? img : `${baseUrl}${img}`
          )
        : [],
    }));

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// ────────────────────────────────────────────────
// All routes below this are protected (admin only)
// ────────────────────────────────────────────────
router.use(protect);

// POST /api/projects – Create new project (admin)
router.post(
  '/',
  upload.array('images', 10), // max 10 files
  async (req, res) => {
    try {
      const { title, description, type, date, details } = req.body;

      // Basic validation
      if (!title || !type || !date) {
        return res.status(400).json({ message: 'Title, type, and date are required' });
      }

      const files = req.files || [];
      const imagePaths = files.map(file => `/uploads/${file.filename}`);

      const [result] = await pool.query(
        `INSERT INTO projects 
         (title, description, type, date, details, images, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          title.trim(),
          description?.trim() || null,
          type,
          date,
          details?.trim() || null,
          JSON.stringify(imagePaths),
        ]
      );

      res.status(201).json({
        id: result.insertId,
        message: 'Project created successfully',
      });
    } catch (err) {
      console.error('Create project error:', err);
      res.status(500).json({ message: 'Failed to create project' });
    }
  }
);

// PUT /api/projects/:id – Update existing project (admin)
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, date, details, existingImages } = req.body;

    if (!title || !type || !date) {
      return res.status(400).json({ message: 'Title, type, and date are required' });
    }

    let images = [];
    if (existingImages) {
      try {
        images = JSON.parse(existingImages);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid existingImages format' });
      }
    }

    const files = req.files || [];
    const newPaths = files.map(file => `/uploads/${file.filename}`);
    images = [...images, ...newPaths];

    const [result] = await pool.query(
      `UPDATE projects 
       SET title = ?, description = ?, type = ?, date = ?, details = ?, images = ?
       WHERE id = ?`,
      [
        title.trim(),
        description?.trim() || null,
        type,
        date,
        details?.trim() || null,
        JSON.stringify(images),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id – Delete project (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;
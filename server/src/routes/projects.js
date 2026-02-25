import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only images & mp4 allowed'));
  }
});

// GET /api/projects  (public – no auth)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects ORDER BY date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// All routes below are protected
router.use(protect);

// POST /api/projects
router.post(
  '/',
  upload.array('images', 10),
  async (req, res) => {
    try {
      const { title, description, type, date, details } = req.body;
      const files = req.files;

      const imagePaths = files.map(file => `/uploads/${file.filename}`);

      const [result] = await pool.query(
        'INSERT INTO projects (title, description, type, date, details, images) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, type, date, details, JSON.stringify(imagePaths)]
      );

      res.status(201).json({ id: result.insertId, message: 'Project created' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating project' });
    }
  }
);

// PUT /api/projects/:id
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, date, details, existingImages } = req.body;
    const files = req.files || [];

    let images = existingImages ? JSON.parse(existingImages) : [];
    const newPaths = files.map(file => `/uploads/${file.filename}`);
    images = [...images, ...newPaths];

    await pool.query(
      'UPDATE projects SET title=?, description=?, type=?, date=?, details=?, images=? WHERE id=?',
      [title, description, type, date, details, JSON.stringify(images), id]
    );

    res.json({ message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
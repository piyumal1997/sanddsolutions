// server/src/routes/projects.js
import express from "express";
import pool from "../config/db.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads/")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4/;
    if (
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpg, jpeg, png, gif) and mp4 videos allowed"));
    }
  },
});

const projectSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string()
    .valid(
      "residential-solar",
      "industrial-solar",
      "automation",
      "engineering",
      "cooling solution",
    )
    .required(),
  date: Joi.date().required(),
  details: Joi.string().allow(""),
  existingImages: Joi.string().allow(""),
});

router.get("/", async (req, res) => {
  try {
    let query =
      "SELECT id, title, description, type, date, details, images FROM projects WHERE 1=1";
    const params = [];

    if (req.query.type && req.query.type !== "all") {
      query += " AND type = ?";
      params.push(req.query.type);
    }

    if (req.query.search?.trim()) {
      const term = `%${req.query.search.trim()}%`;
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(term, term);
    }

    query += " ORDER BY date DESC";

    const [rows] = await pool.query(query, params);

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://sanddsolutions.lk"
        : "http://localhost:3000";

    const projects = rows.map((p) => ({
      ...p,
      images: p.images
        ? JSON.parse(p.images).map((img) =>
            img.startsWith("http") ? img : `${baseUrl}${img}`,
          )
        : [],
    }));

    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("GET /projects error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch projects",
        error: err.message,
      });
  }
});

router.use(protect);
router.use(restrictTo("admin", "manager"));

// router.post("/", upload.array("images", 10), async (req, res) => {
//   const { error } = projectSchema.validate(req.body);
//   if (error)
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });

//   try {
//     const { title, description, type, date, details } = req.body;
//     const files = req.files || [];
//     const imagePaths = files.map((f) => `/uploads/${f.filename}`);

//     const [result] = await pool.query(
//       `INSERT INTO projects 
//        (title, description, type, date, details, images, created_by, created_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [
//         title.trim(),
//         description.trim(),
//         type,
//         date,
//         details?.trim() || null,
//         JSON.stringify(imagePaths),
//         req.user.id,
//       ],
//     );

//     res.status(201).json({
//       success: true,
//       message: "Project created successfully",
//       data: { id: result.insertId },
//     });
//   } catch (err) {
//     console.error("POST /projects error:", err);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Failed to create project",
//         error: err.message,
//       });
//   }
// });

router.post("/", upload.array("images", 10), async (req, res) => {
  // Step 1: Log EVERYTHING that comes in
  console.log('[PROJECT POST] Headers:', req.headers.authorization ? 'Auth present' : 'NO AUTH');
  console.log('[PROJECT POST] Body:', req.body);
  console.log('[PROJECT POST] Files count:', req.files?.length || 0);
  console.log('[PROJECT POST] User object:', req.user ? 'present' : 'MISSING', req.user?.id || '(no id)');

  const { error } = projectSchema.validate(req.body);
  if (error) {
    console.warn('[PROJECT POST] Joi validation failed:', error.details);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { title, description, type, date, details } = req.body;
    const files = req.files || [];
    const imagePaths = files.map(f => `/uploads/${f.filename}`);

    // Critical safety checks
    if (!req.user?.id) {
      console.error('[PROJECT POST] CRITICAL: req.user.id is missing!');
      // Continue with NULL instead of crashing
    }

    const imagesJson = JSON.stringify(imagePaths);
    console.log('[PROJECT POST] Images JSON length:', imagesJson.length);
    console.log('[PROJECT POST] Date received:', date);

    const [result] = await pool.query(
      `INSERT INTO projects 
       (title, description, type, date, details, images, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title.trim(),
        description.trim(),
        type,
        date || null,               // ← safety
        details?.trim() || null,
        imagesJson,
        req.user?.id || null,
      ]
    );

    console.log('[PROJECT POST] SUCCESS - Inserted ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { id: result.insertId },
    });
  } catch (err) {
    // Very detailed crash log
    console.error('[PROJECT POST] CRASHED:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql ? err.sql.substring(0, 500) : null,
      stack: err.stack?.substring(0, 500),
      body: req.body,
      fileCount: req.files?.length || 0,
      userPresent: !!req.user,
      userId: req.user?.id || 'none',
    });

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: err.message || 'Internal server error',
    });
  }
});

router.put("/:id", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const { title, description, type, date, details, existingImages } =
      req.body;

    let images = [];
    if (existingImages) images = JSON.parse(existingImages);

    const files = req.files || [];
    images.push(...files.map((f) => `/uploads/${f.filename}`));

    const [result] = await pool.query(
      `UPDATE projects 
       SET title=?, description=?, type=?, date=?, details=?, images=?, updated_at=NOW()
       WHERE id = ?`,
      [
        title.trim(),
        description.trim(),
        type,
        date,
        details?.trim() || null,
        JSON.stringify(images),
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("PUT /projects error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update project",
        error: err.message,
      });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE projects SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project deactivated successfully" });
  } catch (err) {
    console.error("DELETE /projects error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to deactivate project",
        error: err.message,
      });
  }
});

export default router;

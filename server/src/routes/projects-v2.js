// NEW FILE: server/src/routes/projects-v2.js (copy with v2 improvements: pagination, standardized responses)
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(
      new Error("Only images (jpg, jpeg, png, gif) and mp4 videos are allowed"),
    );
  },
});

const getSchema = Joi.object({
  type: Joi.string().optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const projectSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  type: Joi.string().required(),
  date: Joi.date().required(),
  details: Joi.string().optional(),
  existingImages: Joi.string().optional(),
});

router.get("/", async (req, res) => {
  const { error, value } = getSchema.validate(req.query);
  if (error)
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });

  try {
    let query =
      "SELECT id, title, description, type, date, details, images FROM projects WHERE 1=1";
    const params = [];

    if (value.type && value.type !== "all") {
      query += " AND type = ?";
      params.push(value.type);
    }

    if (value.search && value.search.trim()) {
      const searchTerm = `%${value.search.trim()}%`;
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(searchTerm, searchTerm);
    }

    query += " ORDER BY date DESC LIMIT ? OFFSET ?";
    params.push(value.limit, (value.page - 1) * value.limit);

    const [rows] = await pool.query(query, params);

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM projects",
    ); // For meta

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://sanddsolutions.lk"
        : "http://localhost:3000";

    const projects = rows.map((project) => ({
      ...project,
      images: project.images
        ? JSON.parse(project.images).map((img) =>
            img.startsWith("http") ? img : `${baseUrl}${img}`,
          )
        : [],
    }));

    res.json({
      success: true,
      data: projects,
      meta: { total, page: value.page, limit: value.limit },
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching projects",
      });
  }
});

router.use(protect);

router.post("/", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const { title, description, type, date, details } = req.body;

    const files = req.files || [];
    const imagePaths = files.map((file) => `/uploads/${file.filename}`);

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
      ],
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: "Project created successfully",
    });
  } catch (err) {
    console.error("Create project error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create project" });
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
    if (existingImages) {
      try {
        images = JSON.parse(existingImages);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid existingImages format" });
      }
    }

    const files = req.files || [];
    const newPaths = files.map((file) => `/uploads/${file.filename}`);
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
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("Update project error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete project error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete project" });
  }
});

export default router;

// server/src/routes/employees.js
import express from "express";
import pool from "../config/db.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ====================== MULTER SETUP ======================
const uploadDir = path.join(process.cwd(), "uploads/employees");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `emp-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG files allowed"));
    }
  },
});

// ====================== VALIDATION ======================
const employeeSchema = Joi.object({
  full_name: Joi.string().min(3).max(150).required(),
  position: Joi.string().min(2).max(100).required(),
  address: Joi.string().allow(null, ""),
  nic_number: Joi.string().min(10).max(20).required(),
  contact_number: Joi.string().min(10).max(15).required(),
  birthday: Joi.date().allow(null, ""),
  education_qualifications: Joi.array().items(Joi.string()).allow(null),
  joined_at: Joi.date().allow(null, ""),
});

// ====================== PUBLIC ROUTE ======================
router.get("/", async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT id, employee_number, full_name, position, address, nic_number, 
             contact_number, photo, education_qualifications, birthday, joined_at
      FROM employees 
      WHERE is_active = 1 
      ORDER BY full_name ASC
    `);

    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://api.sanddsolutions.lk"
      : "http://localhost:3000";

    const result = employees.map(emp => ({
      ...emp,
      photo: emp.photo ? `${baseUrl}${emp.photo}` : null,
      education_qualifications: emp.education_qualifications 
        ? JSON.parse(emp.education_qualifications) 
        : []
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("GET /employees error:", err);
    res.status(500).json({ success: false, message: "Failed to load employees" });
  }
});

// ====================== PROTECTED ROUTES ======================
router.use(protect);
router.use(restrictTo("admin"));

// POST - Create Employee
router.post("/", upload.single("photo"), async (req, res) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { full_name, position, address, nic_number, contact_number, birthday, education_qualifications, joined_at } = req.body;

  try {
    const [last] = await pool.query("SELECT employee_number FROM employees ORDER BY id DESC LIMIT 1");
    let nextNum = 1;
    if (last.length > 0) {
      nextNum = Number.parseInt(last[0].employee_number.split("-")[1]) + 1;
    }
    const employee_number = `EMP-${nextNum.toString().padStart(4, "0")}`;

    const photoPath = req.file ? `/uploads/employees/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO employees 
       (employee_number, full_name, position, address, nic_number, contact_number, photo, 
        education_qualifications, birthday, joined_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        employee_number,
        full_name.trim(),
        position.trim(),
        address || null,
        nic_number,
        contact_number,
        photoPath,
        education_qualifications ? JSON.stringify(education_qualifications) : null,
        birthday || null,
        joined_at || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee_number,
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add employee" });
  }
});

// PUT - Update Employee
router.put("/:id", upload.single("photo"), async (req, res) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { full_name, position, address, nic_number, contact_number, birthday, education_qualifications, joined_at } = req.body;
  const photoPath = req.file ? `/uploads/employees/${req.file.filename}` : null;

  try {
    let query = `UPDATE employees SET full_name=?, position=?, address=?, nic_number=?, contact_number=?, 
                 education_qualifications=?, birthday=?, joined_at=?`;
    let params = [
      full_name.trim(),
      position.trim(),
      address || null,
      nic_number,
      contact_number,
      education_qualifications ? JSON.stringify(education_qualifications) : null,
      birthday || null,
      joined_at || null
    ];

    if (photoPath) {
      query += ", photo = ?";
      params.push(photoPath);
    }

    query += " WHERE id = ?";
    params.push(req.params.id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update employee" });
  }
});

// DELETE → Soft Delete (Deactivate)
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE employees SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee has been deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to deactivate employee" });
  }
});

export default router;
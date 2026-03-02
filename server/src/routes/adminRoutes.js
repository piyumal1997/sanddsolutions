// server/src/routes/adminRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import Joi from "joi";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

// List all users
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, nic_number, email, role, is_active, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// Create new user
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  nic_number: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("admin", "manager").required(),
});

router.post("/users", async (req, res) => {
  const { error } = createUserSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const { name, nic_number, email, password, role } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR nic_number = ?",
      [email, nic_number],
    );
    if (existing.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "Email or NIC already exists" });

    const hashed = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO users (name, nic_number, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, nic_number, email, hashed, role],
    );

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

// Update user (role or active status)
router.put("/users/:id", async (req, res) => {
  const { is_active, role } = req.body;
  const id = req.params.id;

  if (is_active === undefined && !role) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  try {
    const updates = [];
    const params = [];

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }
    if (role) {
      updates.push("role = ?");
      params.push(role);
    }

    params.push(id);

    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

export default router;

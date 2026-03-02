// server/src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  nic_number: Joi.string().min(10).max(20).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { name, nic_number, email, password } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR nic_number = ?",
      [email, nic_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or NIC number already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      "INSERT INTO users (name, nic_number, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), nic_number.trim(), email.trim(), hashed, "admin"]
    );

    res.status(201).json({
      success: true,
      message: "Admin account created successfully. You can now log in.",
      data: { userId: result.insertId },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create account",
      error: err.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    if (user.is_active !== 1) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact admin.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
});

export default router;
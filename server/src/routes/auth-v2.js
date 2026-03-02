// server/src/routes/auth-v2.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Name must be at least 2 characters",
  }),
  nic_number: Joi.string().min(10).max(20).required().messages({
    "string.empty": "NIC number is required",
  }),
  email: Joi.string().email().max(255).required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.empty": "Password is required",
  }),
  role: Joi.string().valid("admin", "manager").default("manager"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// POST /api/v2/auth/register
router.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  const { name, nic_number, email, password, role = "manager" } = req.body;

  try {
    // Check for duplicates
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR nic_number = ?",
      [email, nic_number],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or NIC number is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      "INSERT INTO users (name, nic_number, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), nic_number.trim(), email.trim(), hashedPassword, role],
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { userId: result.insertId },
    });
  } catch (err) {
    console.error("Registration error:", {
      message: err.message,
      stack: err.stack,
      email,
      nic_number,
    });

    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// POST /api/v2/auth/login
router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, password, role, is_active FROM users WHERE email = ?",
      [email],
    );

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
        message: "Account is deactivated. Please contact the administrator.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT with role included
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
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
    console.error("Login error:", {
      message: err.message,
      stack: err.stack,
      email,
    });

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;

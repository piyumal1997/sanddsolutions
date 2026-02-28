// NEW FILE: server/src/routes/auth-v2.js (copy of auth.js with v2 improvements, e.g., better responses)
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import Joi from "joi";

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message }); // v2: Standardized response

  const { email, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashed, "admin"],
    );

    res
      .status(201)
      .json({ success: true, message: "Admin registered – now login" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ success: true, data: { token, user: { email: user.email } } }); // v2: Wrapped in data
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

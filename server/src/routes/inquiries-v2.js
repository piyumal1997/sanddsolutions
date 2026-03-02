// server/src/routes/inquiries-v2.js
// Identical logic to v1, but with standardized v2 response format

import express from "express";
import nodemailer from "nodemailer";
import pool from "../config/db.js";
import Joi from "joi";

const router = express.Router();

const inquirySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(50).allow(null, ""),
  inquiry_type: Joi.string().max(100).required(),
  message: Joi.string().min(10).required(),
  recaptcha_token: Joi.string().required(),
});

router.post("/", async (req, res) => {
  const { error } = inquirySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  const { name, email, phone, inquiry_type, message, recaptcha_token } =
    req.body;

  try {
    // 1. reCAPTCHA verification
    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`,
      },
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success || verifyData.score < 0.3) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed",
        error: verifyData["error-codes"]?.join(", ") || "Low score",
      });
    }

    // 2. Save inquiry
    const [insertResult] = await pool.query(
      `INSERT INTO inquiries 
       (name, email, phone, inquiry_type, message, recaptcha_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        email.trim(),
        phone?.trim() || null,
        inquiry_type.trim(),
        message.trim(),
        verifyData.score || null,
      ],
    );

    const inquiryId = insertResult.insertId;

    // 3. Send emails (same as v1)
    const transporter = nodemailer.createTransport({
      host: "mail.sanddsolutions.lk",
      port: 465,
      secure: true,
      auth: {
        user: "noreply@sanddsolutions.lk",
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: {
        name: `${name} via S&D Website`,
        address: "noreply@sanddsolutions.lk",
      },
      replyTo: email,
      to: "info@sanddsolutions.lk",
      subject: `New Inquiry: ${name} - ${inquiry_type}`,
      html: `...same HTML as v1...`,
    });

    await transporter.sendMail({
      from: `"S&D Solutions" <noreply@sanddsolutions.lk>`,
      to: email,
      subject: "Thank You for Contacting S&D Solutions",
      html: `...same auto-reply HTML as v1...`,
    });

    // 4. Create notifications
    const [recipients] = await pool.query(
      "SELECT id FROM users WHERE role IN ('admin', 'manager') AND is_active = 1",
    );

    for (const recipient of recipients) {
      await pool.query(
        `INSERT INTO notifications 
         (user_id, type, title, message, related_id)
         VALUES (?, 'new_inquiry', ?, ?, ?)`,
        [
          recipient.id,
          "New Customer Inquiry",
          `New inquiry from ${name} (${inquiry_type})`,
          inquiryId,
        ],
      );
    }

    res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: { inquiryId },
    });
  } catch (err) {
    console.error("v2 Inquiry error:", {
      message: err.message,
      stack: err.stack,
      name,
      email,
      type: inquiry_type,
    });

    res.status(500).json({
      success: false,
      message: "Failed to process inquiry",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;

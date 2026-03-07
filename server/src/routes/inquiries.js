// server/src/routes/inquiries.js
import express from 'express';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import Joi from 'joi';

const router = express.Router();

// Protected admin routes
router.use(protect);
router.use(restrictTo('admin', 'manager'));


const inquirySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(50).allow(null, ""),
  inquiry_type: Joi.string().max(100).required(),
  message: Joi.string().min(10).required(),
  recaptcha_token: Joi.string().required(),
});

// Shared footer HTML (used in both emails)
const COMPANY_LOGO_URL = 'https://www.sanddsolutions.lk/assets/sndlogo-F1IGRqvl.png'; // ← Replace with real logo URL

const emailFooter = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #4b5563;">
    <tr>
      <td align="center">
        <img src="${COMPANY_LOGO_URL}" alt="S&D Solutions Logo" style="max-width: 180px; height: auto; margin-bottom: 16px;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="color: #16a34a; font-weight: bold; font-size: 16px; margin-bottom: 8px;">
        S&D Solutions (Pvt) Ltd
      </td>
    </tr>
    <tr>
      <td align="center" style="line-height: 1.6;">
        <p style="margin: 4px 0;">Web: <a href="https://www.sanddsolutions.lk" style="color: #16a34a; text-decoration: none;">www.sanddsolutions.lk</a></p>
        <p style="margin: 4px 0;">Email: <a href="mailto:info@sanddsolutions.lk" style="color: #16a34a; text-decoration: none;">info@sanddsolutions.lk</a></p>
        <p style="margin: 4px 0;">Phone: +94 71 597 4895</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="margin-top: 16px; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} S&D Solutions (Pvt) Ltd. All rights reserved.</p>
      </td>
    </tr>
  </table>
`;

// Public endpoint – no auth required
router.post("/", async (req, res) => {
  const { error } = inquirySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.details[0].message,
    });
  }

  const { name, email, phone, inquiry_type, message, recaptcha_token } = req.body;

  try {
    // 1. Verify reCAPTCHA
    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`,
      }
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
      ]
    );

    const inquiryId = insertResult.insertId;

    // 3. Send emails
    const transporter = nodemailer.createTransport({
      host: "mail.sanddsolutions.lk",
      port: 465,
      secure: true,
      auth: {
        user: "noreply@sanddsolutions.lk",
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // ────────────────────────────────────────────────
    // Admin / Team Notification Email
    // ────────────────────────────────────────────────
    await transporter.sendMail({
      from: {
        name: `${name} via S&D Website`,
        address: "noreply@sanddsolutions.lk",
      },
      replyTo: email,
      to: "info@sanddsolutions.lk",
      subject: `New Inquiry: ${name} - ${inquiry_type}`,
      html: `
        <h2 style="color: #16a34a; margin-bottom: 16px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #16a34a;">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Type:</strong> ${inquiry_type}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
        <p><small>reCAPTCHA score: ${verifyData.score || "N/A"}</small></p>
        <hr style="border-color: #e5e7eb; margin: 24px 0;" />
        ${emailFooter}
      `,
    });

    // ────────────────────────────────────────────────
    // Auto-reply to the person who submitted the inquiry
    // ────────────────────────────────────────────────
    await transporter.sendMail({
      from: `"S&D Solutions" <noreply@sanddsolutions.lk>`,
      to: email,
      subject: "Thank You for Contacting S&D Solutions",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to us! We have received your inquiry and our team will get back to you within 24 hours.</p>
        <p>We appreciate your interest in our services.</p>
        <p>Best regards,<br>
        <strong>The S&D Solutions Team</strong></p>
        
        <hr style="border-color: #e5e7eb; margin: 24px 0;" />
        ${emailFooter}
      `,
    });

    // 4. Create notifications for admins & managers
    const [recipients] = await pool.query(
      "SELECT id FROM users WHERE role IN ('admin', 'manager') AND is_active = 1"
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
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully. We will respond soon.",
    });
  } catch (err) {
    console.error("Inquiry submission failed:", {
      error: err.message,
      stack: err.stack,
      name,
      email,
      type: inquiry_type,
    });

    let clientMessage = "Something went wrong. Please try again later.";
    let status = 500;

    if (err.code === "ER_DUP_ENTRY") {
      clientMessage = "This email or phone may already be registered.";
      status = 409;
    } else if (err.message.includes("reCAPTCHA")) {
      clientMessage = "reCAPTCHA verification failed. Please refresh and try again.";
      status = 400;
    }

    res.status(status).json({
      success: false,
      message: clientMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// GET /api/inquiries – list all inquiries (admin/manager only)
router.get('/', async (req, res) => {
  try {
    const status = req.query.status; // Optional: ?status=pending or ?status=completed

    let query = `
      SELECT 
        i.id, i.name, i.email, i.phone, i.inquiry_type, i.message, 
        i.request_completed, i.updated_by, i.completion_notes, i.created_at, i.updated_at,
        u.email AS updated_by_email
      FROM inquiries i
      LEFT JOIN users u ON i.updated_by = u.id
      ORDER BY i.created_at DESC
    `;
    const params = [];

    if (status === 'pending') {
      query = `SELECT * FROM (${query}) AS sub WHERE request_completed = 0`;
    } else if (status === 'completed') {
      query = `SELECT * FROM (${query}) AS sub WHERE request_completed = 1`;
    }

    const [inquiries] = await pool.query(query, params);

    res.json({ success: true, data: inquiries });
  } catch (err) {
    console.error("GET /inquiries error:", err.message);
    res.status(500).json({ success: false, message: "Failed to load inquiries" });
  }
});

// PUT /api/inquiries/:id/complete – mark as completed + optional notes
router.put('/:id/complete', async (req, res) => {
  const { completion_notes } = req.body; // optional

  try {
    const [result] = await pool.query(
      `UPDATE inquiries 
       SET 
         request_completed = 1, 
         updated_by = ?, 
         completion_notes = ?, 
         updated_at = NOW()
       WHERE id = ? AND request_completed = 0`, // only allow if still pending
      [req.user.id, completion_notes?.trim() || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Inquiry not found or already completed",
      });
    }

    // Optional: Create notification for the user who submitted inquiry (if you store user_id later)
    res.json({ success: true, message: "Inquiry marked as completed" });
  } catch (err) {
    console.error("PUT /inquiries/:id/complete error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update inquiry" });
  }
});

export default router;
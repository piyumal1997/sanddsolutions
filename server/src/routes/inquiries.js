// server/src/routes/inquiries.js
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

  const { name, email, phone, inquiry_type, message, recaptcha_token } =
    req.body;

  try {
    // 1. Verify reCAPTCHA
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

    // Admin notification
    await transporter.sendMail({
      from: {
        name: `${name} via S&D Website`,
        address: "noreply@sanddsolutions.lk",
      },
      replyTo: email,
      to: "info@sanddsolutions.lk",
      subject: `New Inquiry: ${name} - ${inquiry_type}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Type:</strong> ${inquiry_type}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}</p>
        <p><small>reCAPTCHA score: ${verifyData.score || "N/A"}</small></p>
        <hr>
        <p style="color:#666; font-size:0.9em;">
          This message was sent from the website contact form.<br>
          Reply directly to reach the sender.
        </p>
      `,
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: `"S&D Solutions" <noreply@sanddsolutions.lk>`,
      to: email,
      subject: "Thank You for Contacting S&D Solutions",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your message! We've received your inquiry and will get back to you within 24 hours.</p>
        <p>Best regards,<br>
        <strong>The S&D Solutions Team</strong><br>
        Web: <a href="https://sanddsolutions.lk">sanddsolutions.lk</a><br>
        Phone: ${process.env.COMPANY_PHONE || "+94 71 597 4895"}<br>
        Email: <a href="mailto:info@sanddsolutions.lk">info@sanddsolutions.lk</a></p>
      `,
    });

    // 4. Create notifications for admins & managers
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
      clientMessage =
        "reCAPTCHA verification failed. Please refresh and try again.";
      status = 400;
    }

    res.status(status).json({
      success: false,
      message: clientMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;

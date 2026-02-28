// NEW FILE: server/src/routes/inquiries-v2.js (copy with v2 improvements, e.g., standardized responses)
import express from "express";
import nodemailer from "nodemailer";
import pool from "../config/db.js";
import Joi from "joi";

const router = express.Router();

const inquirySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  inquiry_type: Joi.string().required(),
  message: Joi.string().required(),
  recaptcha_token: Joi.string().required(),
});

router.post("/", async (req, res) => {
  const { error } = inquirySchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });

  try {
    const { name, email, phone, inquiry_type, message, recaptcha_token } =
      req.body;

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
        error: "reCAPTCHA verification failed",
        details: verifyData,
      });
    }

    await pool.query(
      `INSERT INTO inquiries (name, email, phone, inquiry_type, message, recaptcha_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        email,
        phone || null,
        inquiry_type,
        message,
        verifyData.score || null,
      ],
    );

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

    res
      .status(200)
      .json({ success: true, message: "Inquiry submitted successfully" });
  } catch (err) {
    console.error("Inquiry error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Internal server error" });
  }
});

export default router;

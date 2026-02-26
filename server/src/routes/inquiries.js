import express from 'express';
import nodemailer from 'nodemailer';
import pool from '../config/db.js'; // your MySQL pool

const router = express.Router();

// Public route – no JWT needed (or add rate-limit later)
router.post('/', async (req, res) => {
  const { name, email, phone, inquiry_type, message, recaptcha_token } = req.body;

  // Basic validation
  if (!name || !email || !inquiry_type || !message || !recaptcha_token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Verify reCAPTCHA
  try {
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success || verifyData.score < 0.3) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed',
        details: verifyData,
      });
    }

    // 2. Save to MySQL (create table `inquiries` if not exists)
    await pool.query(
      `INSERT INTO inquiries (name, email, phone, inquiry_type, message, recaptcha_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phone || null, inquiry_type, message, verifyData.score || null]
    );

    // 3. Send emails via your domain SMTP
    const transporter = nodemailer.createTransport({
      host: 'mail.sanddsolutions.lk',   // ← confirm exact hostname in cPanel Email → Connect Devices
      port: 465,                        // 465 = SSL, 587 = STARTTLS (try both)
      secure: true,                     // true for 465, false for 587
      auth: {
        user: 'noreply@sanddsolutions.lk', // create this email in cPanel if not exists
        pass: process.env.EMAIL_PASSWORD,  // add to cPanel env vars
      },
      // Optional: debug + logger in dev
      // debug: process.env.NODE_ENV !== 'production',
      // logger: true,
    });

    // Test connection (optional – remove in production)
    // await transporter.verify();

    // Admin notification
    await transporter.sendMail({
      from: {
        name: `${name} via S&D Website`,           // shows as: "Piyumal via S&D Website"
        address: 'noreply@sanddsolutions.lk'       // must be your verified email
      },
      replyTo: email,                              // ← this is the key line
      to: 'info@sanddsolutions.lk',
      subject: `New Inquiry: ${name} - ${inquiry_type}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Type:</strong> ${inquiry_type}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        <p><small>reCAPTCHA score: ${verifyData.score || 'N/A'}</small></p>
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
      subject: 'Thank You for Contacting S&D Solutions',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your message! We've received your inquiry and will get back to you within 24 hours.</p>
        <p>Best regards,<br>
        <strong>The S&D Solutions Team</strong><br>
        Web: <a href="https://sanddsolutions.lk">sanddsolutions.lk</a><br>
        Phone: ${process.env.COMPANY_PHONE || '+94 71 597 4895'}<br>
        Email: <a href="mailto:info@sanddsolutions.lk">info@sanddsolutions.lk</a></p>
      `,
    });

    res.status(200).json({ success: true, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('Inquiry error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
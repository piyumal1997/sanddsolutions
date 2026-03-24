import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting (10 req/min per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests – try again soon' },
});
router.use(limiter);

// ====================== PUBLIC ROUTES (NO AUTH) ======================

// GET /api/payments/:unique_id/info  → Customer can view payment details
router.get('/:unique_id/info', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, unique_id, customer_name, amount, description, status, expiry_date, created_at 
       FROM payment_links 
       WHERE unique_id = ?`,
      [req.params.unique_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment link not found" });
    }

    const link = rows[0];

    // Check if expired
    if (link.expiry_date && new Date(link.expiry_date) < new Date()) {
      await pool.query("UPDATE payment_links SET status = 'expired' WHERE id = ?", [link.id]);
      return res.status(410).json({ success: false, message: "This payment link has expired" });
    }

    res.json({
      success: true,
      data: {
        unique_id: link.unique_id,
        customer_name: link.customer_name,
        amount: link.amount,
        description: link.description,
        status: link.status,
        expiry_date: link.expiry_date,
      }
    });
  } catch (err) {
    console.error("Info endpoint error:", err.message);
    res.status(500).json({ success: false, message: "Failed to load payment info" });
  }
});

// Protected routes for admin only (changed restrictTo to 'admin')
router.use(protect);
router.use(restrictTo('admin'));

const linkSchema = Joi.object({
  customer_name: Joi.string().min(3).required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().allow(''),
  amount: Joi.number().min(0.01).required(),
  description: Joi.string().allow(''),
  expiry_date: Joi.date().optional(),
  send_email: Joi.boolean().default(false),
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

// POST /api/payments/create-link – Create link + optional auto-send email
router.post('/create-link', async (req, res) => {
  const { error } = linkSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { customer_name, customer_email, customer_phone, amount, description, expiry_date, send_email } = req.body;
  const unique_id = uuidv4();
  const link = `https://sanddsolutions.lk/pay/${unique_id}`;

  try {
    const [result] = await pool.query(
      `INSERT INTO payment_links 
       (unique_id, customer_name, customer_email, customer_phone, amount, description, created_by, expiry_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [unique_id, customer_name, customer_email, customer_phone || null, amount, description, req.user.id, expiry_date || null]
    );

    if (send_email) {
      sendPaymentEmail(customer_email, customer_name, link, amount, description).catch(console.error);
    }

    res.json({
      success: true,
      link,
      id: result.insertId,
    });
  } catch (err) {
    console.error('Create link error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create link' });
  }
});

// PUT /api/payments/:id/edit – Edit link + optional re-send email
router.put('/:id/edit', async (req, res) => {
  const { error } = linkSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { customer_name, customer_email, customer_phone, amount, description, expiry_date, send_email } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE payment_links 
       SET customer_name = ?, customer_email = ?, customer_phone = ?, amount = ?, description = ?, expiry_date = ?, updated_at = NOW()
       WHERE id = ? AND status = 'pending' AND created_by = ?`,
      [customer_name, customer_email, customer_phone || null, amount, description, expiry_date || null, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Link not found or cannot be edited' });
    }

    const [linkRow] = await pool.query('SELECT unique_id FROM payment_links WHERE id = ?', [req.params.id]);
    const link = `https://sanddsolutions.lk/pay/${linkRow[0].unique_id}`;

    if (send_email) sendPaymentEmail(customer_email, customer_name, link, amount, description).catch(console.error);

    res.json({ success: true, message: 'Link updated' });
  } catch (err) {
    console.error('Edit link error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update link' });
  }
});

// GET /api/payments – List all payment links
router.get('/', async (req, res) => {
  try {
    const [links] = await pool.query(
      `SELECT pl.*, u.email as created_by_email, pd.*
       FROM payment_links pl
       LEFT JOIN users u ON pl.created_by = u.id
       LEFT JOIN payment_details pd ON pl.id = pd.payment_link_id
       ORDER BY pl.created_at DESC`
    );

    res.json({ success: true, data: links });
  } catch (err) {
    console.error('List payments error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load payments' });
  }
});

// POST /api/payments/notify – Webhook
router.post('/notify', async (req, res) => {
  const ip = req.ip;
  const whitelistedIPs = ['34.126.106.23', '34.87.135.99'];
  if (!whitelistedIPs.includes(ip)) return res.status(403).send('Forbidden');

  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

  const local_md5sig = crypto.createHash('md5').update(
    merchant_id + order_id + payhere_amount + payhere_currency + status_code + crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase()
  ).digest('hex').toUpperCase();

  if (local_md5sig !== md5sig) return res.status(400).send('Invalid signature');

  try {
    await pool.query(
      `UPDATE payment_links 
       SET status = ? 
       WHERE unique_id = ?`,
      [status_code === '2' ? 'completed' : 'failed', order_id]
    );

    await pool.query(
      `UPDATE payment_details 
       SET payhere_status_code = ?, completed_at = NOW()
       WHERE payment_link_id = (SELECT id FROM payment_links WHERE unique_id = ?)`,
      [status_code, order_id]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).send();
  }
});

// POST /api/payments/:unique_id/submit-form – Customer submits
router.post('/:unique_id/submit-form', async (req, res) => {
  const { address, phone, email } = req.body;

  try {
    const [link] = await pool.query(
      `SELECT id, amount, status, expiry_date FROM payment_links WHERE unique_id = ?`,
      [req.params.unique_id]
    );

    if (link.length === 0 || link[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invalid or completed link' });
    }

    if (link[0].expiry_date && new Date(link[0].expiry_date) < new Date()) {
      await pool.query('UPDATE payment_links SET status = "expired" WHERE id = ?', [link[0].id]);
      return res.status(400).json({ success: false, message: 'Link expired' });
    }

    await pool.query(
      `INSERT INTO payment_details 
       (payment_link_id, customer_name, address, phone, email, created_at)
       VALUES ((SELECT customer_name FROM payment_links WHERE id = ?), ?, ?, ?, ?, NOW())`,
      [link[0].id, address, phone, email]
    );

    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
    const hash = crypto.createHash('md5').update(
      merchant_id + req.params.unique_id + link[0].amount.toFixed(2) + 'LKR' + crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase()
    ).digest('hex').toUpperCase();

    res.json({ success: true, hash, merchant_id, amount: link[0].amount.toFixed(2), currency: 'LKR', order_id: req.params.unique_id });
  } catch (err) {
    console.error('Submit form error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit form' });
  }
});

// Email sender (async)
async function sendPaymentEmail(email, name, link, amount, description) {
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
    from: `"S&D Solutions" <noreply@sanddsolutions.lk>`,
    to: email,
    subject: "Your Payment Link from S&D Solutions",
    html: `
      <p>Hi ${name},</p>
      <p>Please complete your payment of LKR ${amount} by clicking the link below:</p>
      <a href="${link}" style="background: #16a34a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Pay Now</a>
      <p>Description: ${description || 'N/A'}</p>
      <p>If you didn't request this, please ignore.</p>
      <p>Best regards,<br>S&D Solutions Team</p>
      ${emailFooter}  // Your emailFooter from inquiries.js
    `,
  });
}

export default router;
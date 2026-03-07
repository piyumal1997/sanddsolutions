// server/src/routes/notifications.js
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// GET /api/notifications – unread + recent for current user
router.get("/", async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT id, type, title, message, related_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("Notifications fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to load notifications" });
  }
});

// PUT /api/notifications/:id/read – mark as read
router.put("/:id/read", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
});

// DELETE /api/notifications/:id – remove notification
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Notification delete error:", err);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

export default router;
// server/src/routes/notifications.js
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// ====================== GET ALL NOTIFICATIONS ======================
// GET /api/notifications - Get unread + recent notifications for current user
router.get("/", async (req, res) => {
  try {
    const { limit = 20, unread_only = false } = req.query;

    let query = `
      SELECT id, type, title, message, related_id, is_read, created_at
      FROM notifications 
      WHERE user_id = ?
    `;

    const params = [req.user.id];

    // Filter only unread if requested
    if (unread_only === 'true') {
      query += " AND is_read = 0";
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(parseInt(limit));

    const [notifications] = await pool.query(query, params);

    // Get unread count
    const [unreadCountResult] = await pool.query(
      "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id]
    );

    res.json({
      success: true,
      data: notifications,
      unread_count: unreadCountResult[0].unread_count,
      total: notifications.length,
    });
  } catch (err) {
    console.error("Notifications fetch error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to load notifications"
    });
  }
});

// ====================== MARK AS READ ======================
// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1, read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or does not belong to you"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    console.error("Mark as read error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
});

// ====================== MARK ALL AS READ ======================
// NEW: PUT /api/notifications/read-all
router.put("/read-all", async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1, read_at = NOW() 
       WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      count: result.affectedRows
    });
  } catch (err) {
    console.error("Mark all as read error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read"
    });
  }
});

// ====================== DELETE NOTIFICATION ======================
// DELETE /api/notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or does not belong to you"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (err) {
    console.error("Notification delete error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification"
    });
  }
});

// ====================== DELETE ALL READ NOTIFICATIONS ======================
// NEW: DELETE /api/notifications/read-all (cleanup old read notifications)
router.delete("/read-all", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE user_id = ? AND is_read = 1",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "All read notifications deleted",
      count: result.affectedRows
    });
  } catch (err) {
    console.error("Delete all read notifications error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete read notifications"
    });
  }
});

export default router;
// server/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [users] = await pool.query(
        "SELECT id, email, role, is_active FROM users WHERE id = ?",
        [decoded.id],
      );

      if (users.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      const user = users[0];
      if (user.is_active !== 1) {
        return res
          .status(403)
          .json({ success: false, message: "Account is deactivated" });
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization token required" });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

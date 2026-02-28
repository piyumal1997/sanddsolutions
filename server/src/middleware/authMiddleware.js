// server/src/middleware/authMiddleware.js (updated to check role if needed)
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, email }

      // NEW: Optional role check (uncomment if needed)
      // if (decoded.role !== 'admin') {
      //   return res.status(403).json({ message: 'Not authorized – admin only' });
      // }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized – token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized – no token" });
  }
};

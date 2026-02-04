const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    // Normalize roles input
    if (typeof roles === "string") {
      roles = [roles];
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔒 STRICT PAYLOAD SHAPE
      if (!decoded?.id || !decoded?.role) {
        return res.status(401).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      // Attach only what you need (prevents bugs)
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      // 🔐 Role-based access
      if (
        roles.length &&
        decoded.role !== "SUPER_ADMIN" &&
        !roles.includes(decoded.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient permissions",
        });
      }

      next();
    } catch (err) {
      console.error("AUTH MIDDLEWARE ERROR 👉", err.message);
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
  };
};

module.exports = { auth };

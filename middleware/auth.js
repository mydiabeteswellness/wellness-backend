const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    // roles can be string or array
    if (typeof roles === "string") {
      roles = [roles];
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }

      if (decoded.role !== "SUPER_ADMIN") {
        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ msg: "Forbidden: insufficient role" });
        }
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ msg: "Token is not valid" });
    }
  };
};

module.exports = { auth };

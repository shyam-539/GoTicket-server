import jwt from "jsonwebtoken";

export const authorizedAdmin = (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token =
      req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No Token Provided" });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: err.name === "TokenExpiredError"
            ? "Token Expired, Please Login Again"
            : "Invalid Token",
        });
      }

      // Check admin role
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin Access Only" });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

import { verifyAccessToken } from "../utils/jwt.js";

export default function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No auth header" });

    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

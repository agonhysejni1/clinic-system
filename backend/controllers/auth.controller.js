import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  saveRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
} from "../services/auth.service.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { email, password, role = "PATIENT", name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already used" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashed, role, name },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    // store refresh token in DB with expiry
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    // set httpOnly cookie for refresh
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // check token exists in DB and not revoked
    const dbToken = await findRefreshToken(token);
    if (!dbToken || dbToken.revoked)
      return res.status(401).json({ message: "Invalid refresh token" });

    // verify JWT signature
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await revokeRefreshToken(token);
      res.clearCookie("refreshToken");
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

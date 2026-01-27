import jwt from "jsonwebtoken";

const ACCESS_EXP = "15m";
const REFRESH_EXP = "30d";

export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXP });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: REFRESH_EXP });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_SECRET);

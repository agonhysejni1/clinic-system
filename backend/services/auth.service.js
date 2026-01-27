import { prisma } from "../config/prisma.js";

export const saveRefreshToken = async (userId, token, expiresAt) => {
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

export const revokeRefreshToken = async (token) => {
  return prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
};

export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({ where: { token } });
};

import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/hash.js";

/**
 * GET /api/users
 * Admin only: list users (pagination optional)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await prisma.user.findMany({
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Admin or the user themself
 */
export const getUserById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user; // set by auth middleware

    if (!requestor)
      return res.status(401).json({ message: "Not authenticated" });

    if (requestor.role !== "ADMIN" && requestor.id !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/:id
 * Admin or self. If password provided -> hash it.
 */
export const updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user;
    const { name, email, password } = req.body;

    if (!requestor)
      return res.status(401).json({ message: "Not authenticated" });
    if (requestor.role !== "ADMIN" && requestor.id !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await hashPassword(password);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    // handle unique email violation
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Optionally cascade / cleanup doctor/patient rows manually or rely on DB cascade if set
    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

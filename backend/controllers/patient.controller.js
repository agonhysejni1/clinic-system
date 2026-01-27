import { prisma } from "../config/prisma.js";

/**
 * GET /api/patients
 * Admin only
 */
export const getPatients = async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    res.json(patients);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/:id
 * Admin or same user's patient record
 */
export const getPatientById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true, appointments: true },
    });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // allow admin or owner (userId match)
    if (requestor.role !== "ADMIN" && requestor.id !== patient.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(patient);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients
 * Admin creates patient for existing user
 * body: { userId, phone? }
 */
export const createPatient = async (req, res, next) => {
  try {
    const { userId, phone } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const patient = await prisma.patient.create({
      data: { userId: Number(userId), phone },
      include: { user: true },
    });

    res.status(201).json(patient);
  } catch (err) {
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Patient already exists for this user" });
    }
    next(err);
  }
};

/**
 * PATCH /api/patients/:id
 * Admin or owner
 */
export const updatePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user;
    const { phone } = req.body;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    if (requestor.role !== "ADMIN" && requestor.id !== patient.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: { phone },
      include: { user: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/patients/:id
 * Admin only
 */
export const deletePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.patient.delete({ where: { id } });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    next(err);
  }
};

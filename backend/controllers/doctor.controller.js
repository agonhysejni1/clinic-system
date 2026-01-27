import { prisma } from "../config/prisma.js";

/**
 * GET /api/doctors
 */
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        appointments: true,
      },
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/doctors
 * Admin creates doctor row for an existing user (userId)
 * body: { userId, specialty }
 */
export const createDoctor = async (req, res, next) => {
  try {
    const { userId, specialty } = req.body;
    if (!userId || !specialty)
      return res.status(400).json({ message: "userId and specialty required" });

    // ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // create doctor
    const doctor = await prisma.doctor.create({
      data: { userId: Number(userId), specialty },
      include: { user: true },
    });

    res.status(201).json(doctor);
  } catch (err) {
    // unique constraint (userId)
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Doctor already exists for this user" });
    }
    next(err);
  }
};

/**
 * PATCH /api/doctors/:id
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { specialty } = req.body;

    const updated = await prisma.doctor.update({
      where: { id },
      data: { specialty },
      include: { user: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/doctors/:id
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.doctor.delete({ where: { id } });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    next(err);
  }
};

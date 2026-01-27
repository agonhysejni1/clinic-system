import { prisma } from "../config/prisma.js";

/**
 * Helper: find patient row for current user (if exists)
 */
const getPatientForUser = async (userId) => {
  return prisma.patient.findUnique({ where: { userId } });
};

/**
 * POST /api/appointments
 * - If user is PATIENT => create appointment for their Patient record (no patientId in body needed)
 * - If ADMIN => must provide patientId
 * body: { doctorId, date } (ISO string)
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date } = req.body;
    const requestor = req.user;

    if (!doctorId || !date)
      return res
        .status(400)
        .json({ message: "doctorId and date are required" });

    // ensure doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: Number(doctorId) },
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    let patientId = req.body.patientId;

    if (requestor.role === "PATIENT") {
      const patient = await getPatientForUser(requestor.id);
      if (!patient)
        return res
          .status(400)
          .json({ message: "No patient profile found for this user" });
      patientId = patient.id;
    } else if (requestor.role !== "ADMIN") {
      // only ADMIN or PATIENT allowed to create appointments directly
      return res
        .status(403)
        .json({ message: "Only patients or admin can create appointments" });
    }

    if (!patientId)
      return res
        .status(400)
        .json({ message: "patientId required for admin creation" });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: Number(doctorId),
        patientId: Number(patientId),
        date: new Date(date),
        status: "PENDING",
      },
      include: {
        doctor: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        patient: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments
 * - ADMIN => all
 * - DOCTOR => appointments where doctorId matches the doctor's id (doctor row linked by userId)
 * - PATIENT => appointments where patient.userId = req.user.id
 */
export const getAppointments = async (req, res, next) => {
  try {
    const requestor = req.user;

    if (requestor.role === "ADMIN") {
      const list = await prisma.appointment.findMany({
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
        orderBy: { date: "desc" },
      });
      return res.json(list);
    }

    if (requestor.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: requestor.id },
      });
      if (!doctor)
        return res.status(400).json({ message: "Doctor profile not found" });

      const list = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
        orderBy: { date: "desc" },
      });
      return res.json(list);
    }

    // PATIENT
    if (requestor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: requestor.id },
      });
      if (!patient)
        return res.status(400).json({ message: "Patient profile not found" });

      const list = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
        orderBy: { date: "desc" },
      });
      return res.json(list);
    }

    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/:id
 * Access: Admin, Doctor assigned to appointment, or Patient owner
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // admin ok
    if (requestor.role === "ADMIN") return res.json(appointment);

    // doctor check
    if (requestor.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: requestor.id },
      });
      if (doctor?.id !== appointment.doctorId)
        return res.status(403).json({ message: "Forbidden" });
      return res.json(appointment);
    }

    // patient check
    if (requestor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: requestor.id },
      });
      if (patient?.id !== appointment.patientId)
        return res.status(403).json({ message: "Forbidden" });
      return res.json(appointment);
    }

    res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Only DOCTOR (assigned) or ADMIN can change status (APPROVED/CANCELED)
 * Body: { status: "APPROVED" | "CANCELED" }
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const requestor = req.user;

    if (!["APPROVED", "CANCELED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (requestor.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: requestor.id },
      });
      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else if (requestor.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/appointments/:id
 * Patient cancels own appointment or Admin can delete
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const requestor = req.user;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (requestor.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: requestor.id },
      });
      if (!patient || patient.id !== appointment.patientId)
        return res.status(403).json({ message: "Forbidden" });
    } else if (requestor.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.appointment.delete({ where: { id } });
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    next(err);
  }
};

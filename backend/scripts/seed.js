import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

async function main() {
  const salt = 10;
  console.log("Seeding database...");

  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.refreshToken.deleteMany().catch(() => {});
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("admin123", salt);
  const doctorPass = await bcrypt.hash("doctor123", salt);
  const patientPass = await bcrypt.hash("patient123", salt);

  const admin = await prisma.user.create({
    data: {
      email: "admin@clinic.test",
      password: adminPass,
      role: "ADMIN",
      name: "Admin User",
    },
  });

  const docUser = await prisma.user.create({
    data: {
      email: "doc@clinic.test",
      password: doctorPass,
      role: "DOCTOR",
      name: "Dr. Who",
    },
  });

  const patUser = await prisma.user.create({
    data: {
      email: "pat@clinic.test",
      password: patientPass,
      role: "PATIENT",
      name: "Patient Zero",
    },
  });

  const doctor = await prisma.doctor.create({
    data: { userId: docUser.id, specialty: "General" },
  });

  const patient = await prisma.patient.create({
    data: { userId: patUser.id, phone: "555-0110" },
  });

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      date: new Date(Date.now() + 24 * 3600 * 1000),
      status: "PENDING",
    },
  });

  console.log("Seed done:");
  console.log({
    adminEmail: admin.email,
    doctorEmail: docUser.email,
    patientEmail: patUser.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

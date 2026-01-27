import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointment.controller.js";

const router = Router();

// create appointment (patients) - patients or admin
router.post("/", auth, createAppointment);

// get list - returns items relevant to the requester role
router.get("/", auth, getAppointments);

router.get("/:id", auth, getAppointmentById);

// doctors approve/cancel
router.patch(
  "/:id/status",
  auth,
  authorize(["DOCTOR", "ADMIN"]),
  updateAppointmentStatus,
);

// cancel appointment (patient or admin)
router.delete("/:id", auth, cancelAppointment);

export default router;

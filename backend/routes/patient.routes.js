import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";

const router = Router();

router.get("/", auth, authorize(["ADMIN"]), getPatients);
router.get("/:id", auth, getPatientById); // admin or self-check inside controller
router.post("/", auth, authorize(["ADMIN"]), createPatient);
router.patch("/:id", auth, updatePatient);
router.delete("/:id", auth, authorize(["ADMIN"]), deletePatient);

export default router;

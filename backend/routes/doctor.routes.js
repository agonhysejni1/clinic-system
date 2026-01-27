import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";

const router = Router();

router.get("/", auth, getDoctors); // all authenticated users can view list
router.get("/:id", auth, getDoctorById);
router.post("/", auth, authorize(["ADMIN"]), createDoctor);
router.patch("/:id", auth, authorize(["ADMIN"]), updateDoctor);
router.delete("/:id", auth, authorize(["ADMIN"]), deleteDoctor);

export default router;

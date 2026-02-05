import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", auth, getCurrentUser);
router.get("/", auth, authorize(["ADMIN"]), getUsers);
router.get("/:id", auth, getUserById);
router.patch("/:id", auth, updateUser);
router.delete("/:id", auth, authorize(["ADMIN"]), deleteUser);

export default router;

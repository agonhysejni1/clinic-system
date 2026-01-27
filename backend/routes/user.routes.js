import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", auth, authorize(["ADMIN"]), getUsers);
router.get("/:id", auth, getUserById); // controller checks access (admin or self)
router.patch("/:id", auth, updateUser); // controller checks access
router.delete("/:id", auth, authorize(["ADMIN"]), deleteUser);

export default router;

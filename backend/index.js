import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);

app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

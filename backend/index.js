import express from "express";
import "dotenv/config";
import { prisma } from "./config/prisma.js";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

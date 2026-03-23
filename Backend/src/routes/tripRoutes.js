import express from "express";
import {
  createTrip,
  joinTrip,
  getTrip
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/create", createTrip);

router.post("/join", joinTrip);

router.get("/:id", getTrip);

export { router as tripRoutes }; // Named export

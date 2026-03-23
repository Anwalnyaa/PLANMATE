import express from "express";
import {
  submitPreference,
  getTripPreferences,
} from "../controllers/preferenceController.js";

const router = express.Router();

router.post("/submit", submitPreference);         // each member submits prefs
router.get("/:tripId", getTripPreferences);       // get all prefs + group profile

export default router;
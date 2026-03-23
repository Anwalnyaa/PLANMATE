
import express from "express";
import { createItinerary } from "../controllers/itineraryController.js";
import supabase from "../config/supabaseClient.js";

const router = express.Router();

// POST /api/itinerary/generate/:tripId — generates + saves itinerary
router.post("/generate/:tripId", createItinerary);

// GET /api/itinerary/:tripId — fetches already-saved itinerary for a trip
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const { data, error } = await supabase
      .from("itineraries")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "No itinerary found for this trip. Make sure all participants have submitted preferences.",
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("[GET /itinerary/:tripId]", err);
    return res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

export default router;

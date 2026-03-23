import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import 'dotenv/config';
import itineraryRoutes from "./routes/itineraryRoutes.js";
import  { tripRoutes } from "./routes/tripRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import supabase from "./config/supabaseClient.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PlanMate API running");
});

app.use("/api/votes", voteRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/preferences", preferenceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`PlanMate Backend running on port ${PORT}`);

  try {

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .limit(1);

    if (error) throw error;

    console.log("✅ Supabase connected successfully");

  } catch (err) {

    console.error("❌ Supabase connection failed:", err.message);

  }
});

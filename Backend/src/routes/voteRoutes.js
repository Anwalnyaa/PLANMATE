import express from "express";

import {
  submitVote,
  getVotingResult
} from "../controllers/voteController.js";

const router = express.Router();

router.post("/submit", submitVote);

router.get("/result/:tripId", getVotingResult);

export default router;
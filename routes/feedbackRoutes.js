import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// POST: Submit feedback
router.post("/", async (req, res) => {
  try {
    const { rating, comments } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    const feedback = new Feedback({ rating, comments });
    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Fetch all feedback (optional, for admin panel)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

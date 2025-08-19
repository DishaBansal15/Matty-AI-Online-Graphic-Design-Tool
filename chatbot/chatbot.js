// ./chatbot/chatbot.js
import express from "express";
import fetch from "node-fetch";
import classifyInput from "./classifier.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// --- Helper: Call Gemini for classification ---
async function classifyQueryWithGemini(message) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a strict classifier.
Return ONLY ONE WORD: "design" or "other".
Query: "${message}"`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("🔎 Gemini classifier raw response:", rawText);

    return rawText?.toLowerCase() === "design";
  } catch (err) {
    console.error("Error in classifyQueryWithGemini:", err);
    return false;
  }
}

// --- POST /chat ---
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    console.log("🔎 Incoming message:", message);

    // Local classification
    let classification = classifyInput(message);
    console.log("🔎 Local classifier result:", classification);

    // Fallback to Gemini
    if (classification === "other") {
      const isDesign = await classifyQueryWithGemini(message);
      classification = isDesign ? "design" : "other";
    }

    // Reject non-design queries
    if (classification !== "design") {
      return res.json({
        reply:
          "❌ Sorry, I can only help with design-related questions (graphic design, Excalidraw, Matty AI). 🎨",
      });
    }

    // Predefined answers
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("font")) {
      return res.json({
        reply:
          "✨ You can change the font style in Matty AI by selecting the text element and choosing a new font from the top toolbar.",
      });
    }
    if (lowerMsg.includes("color")) {
      return res.json({
        reply:
          "🎨 To change colors, select the object and pick a new color from the style panel on the right.",
      });
    }
    if (lowerMsg.includes("shape")) {
      return res.json({
        reply:
          "⬛ You can insert shapes in Matty AI using the shape tool in the left toolbar.",
      });
    }

    // Fallback to Gemini for custom answers
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
    });

    const data = await geminiResponse.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤔 That’s a design-related question, but I don’t have a specific answer yet.";

    res.json({ reply });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Optional: Health check
router.get("/", (req, res) => {
  res.send("Chat endpoint works. Use POST with JSON body.");
});

export default router;

import { chatwithRagModel } from "../ai";
import express from "express";

const router = express.Router();


router.post("/ask", async (req, res): Promise<any> => {
  try {


    const { question, conversationId } = req.body;

    const userId = req.user!.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!question || !userId || !conversationId) {
      return res.status(400).json({
        error:
          "Missing required fields: question, userId, and conversationId are required",
      });
    }

    const answer = await chatwithRagModel(question, userId, conversationId);
    res.json({ answer });
  } catch (error) {
    console.error("Error in RAG processing:", error);
    res.status(500).json({ error: "Failed to process question" });
  }
});

export default router;

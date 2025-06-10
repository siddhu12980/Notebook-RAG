import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessage,
} from "../controller/conversation_controller";

const router = Router();

// Schemas
const createConversationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});

const updateConversationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
  }),
});

const addMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Message content is required"),
    role: z.enum(["user", "assistant"]).optional(),
  }),
});

// Create a new conversation
router.post(
  "/",
  authenticate,
  validate(createConversationSchema),
  createConversation
);

// Get all conversations for the current user
router.get("/", authenticate, getConversations);

// Get a single conversation by ID
router.get("/:id", authenticate, getConversation);

// Update a conversation
router.put(
  "/:id",
  authenticate,
  validate(updateConversationSchema),
  updateConversation
);

// Delete a conversation
router.delete("/:id", authenticate, deleteConversation);

// Add a message to a conversation
router.post(
  "/:id/messages",
  authenticate,
  validate(addMessageSchema),
  addMessage
);

export default router; 
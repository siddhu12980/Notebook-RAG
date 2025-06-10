import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { 
  generateSummary, 
  generateStudyNotes, 
  saveUserNote,
  getDocumentNotes 
} from "../controller/ai_actions_controller";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// Schema for document ID
const documentIdSchema = z.object({
  body: z.object({
    documentId: z.string().min(1)
  })
});

// Schema for user note
const userNoteSchema = z.object({
  body: z.object({
    documentId: z.string().min(1),
    title: z.string().min(1),
    content: z.string().min(1)
  })
});

// Generate document summary
router.post(
  "/generate-summary",
  authenticate,
  validate(documentIdSchema),
  generateSummary
);

// Generate study notes
router.post(
  "/generate-study-notes",
  authenticate,
  validate(documentIdSchema),
  generateStudyNotes
);

// Save user note
router.post(
  "/save-user-note",
  authenticate,
  validate(userNoteSchema),
  saveUserNote
);

// Get all notes for a document
router.get(
  "/notes/:documentId",
  authenticate,
  getDocumentNotes
);

export default router; 
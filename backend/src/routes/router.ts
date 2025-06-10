import express from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validate } from "../middleware/validate";
import { getProfile, login, register } from "../controller/auth_controller";
import { authenticateToken } from "../middleware/auth";
import documentRoutes from "./document.routes";
import conversationRoutes from "./conversation.routes";
import ragRoutes from "./rag-routes";
import aiActionsRoutes from "./ai_actions.routes";

const router = express.Router();

router.post("/auth/signup", validate(registerSchema), register);
router.post("/auth/login", validate(loginSchema), login);
router.get("/auth/profile", authenticateToken, getProfile);

// Add document routes
router.use("/documents", documentRoutes);
router.use("/rag", ragRoutes);

// Add AI actions routes
router.use("/ai-actions", aiActionsRoutes);

// Add conversation routes
router.use("/conversations", conversationRoutes);

export default router;

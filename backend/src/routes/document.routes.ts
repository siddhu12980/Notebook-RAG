import { Router, Request, Response } from "express";
import { z } from "zod";
import { generateUploadUrl, getFileBuffer } from "../utils/s3";
import { embedPdf } from "../ai/embedding";
import { prisma } from "../db/db";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { setMainDocument } from "../controller/document_controller";

const router = Router();

const presignedUrlSchema = z.object({
  body: z.object({
    filename: z.string().min(1),
    contentType: z.string().min(1),
    conversationId: z.string().optional(),
  }),
});

// Schema for completing document upload
const completeUploadSchema = z.object({
  body: z.object({
    key: z.string().min(1),
    filename: z.string().min(1),
    originalName: z.string().optional(),
    conversationId: z.string().optional(),
  }),
});

// Get a presigned URL for uploading a document
router.post(
  "/presigned-upload",
  authenticate,
  validate(presignedUrlSchema),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user!.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { filename, contentType, conversationId } = req.body;

      // Only allow PDF uploads
      if (contentType !== "application/pdf") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are supported",
        });
      }

      // If conversationId is provided, verify it exists and belongs to the user
      if (conversationId) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId,
          },
        });

        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: "Conversation not found or access denied",
          });
        }
      }

      const { uploadUrl, key } = await generateUploadUrl(
        userId,
        filename,
        contentType
      );

      return res.status(200).json({
        success: true,
        uploadUrl,
        key,
      });
    } catch (error: any) {
      console.error("Error generating presigned URL:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate upload URL",
        error: error.message,
      });
    }
  }
);

// Complete document upload and process the document
router.post(
  "/complete-upload",
  authenticate,
  validate(completeUploadSchema),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user!.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { key, filename, originalName, conversationId } = req.body;

      // Verify that the key belongs to this user
      if (!key.includes(`uploads/${userId}/`)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to document",
        });
      }

      // If conversationId is provided, verify it exists and belongs to the user
      let isMainDocument = false;

      if (conversationId) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId,
          },
          include: {
            documents: true,
          },
        });

        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: "Conversation not found or access denied",
          });
        }

        // Set as main document if this is the first document in the conversation
        isMainDocument = conversation.documents.length === 0;
      }

      // Get file from S3
      const fileBuffer = await getFileBuffer(key);

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          filename,
          originalName: originalName || filename,
          fileType: "application/pdf",
          s3Key: key,
          status: "PROCESSING",
          isMainDocument,
          userId,
          conversationId,
        },
      });

      // Process the document (embed PDF) in the background
      console.log("embedingPdf");

      const embedingPdf = await embedPdf(
        fileBuffer,
        filename,
        userId,
        conversationId
      );

      if (!embedingPdf.success) {
        console.error("Error embedding PDF:", embedingPdf.message);

        await prisma.document.update({
          where: { id: document.id },
          data: {
            status: "FAILED",
            isIndexed: false,
          },
        });

        return res.status(500).json({
          success: false,
          message: "Failed to embed PDF",
        });
      }

      console.log("embedingPdf done", embedingPdf);

      // We return a response immediately to the client
      res.status(200).json({
        success: true,
        message: "Document upload complete, processing started",
        documentId: document.id,
        isMainDocument,
      });

      // Start embedding process after response is sent
      try {
        const result = await embedPdf(
          fileBuffer,
          filename,
          userId,
          conversationId
        );

        // Update document status based on embedding result
        await prisma.document.update({
          where: { id: document.id },
          data: {
            status: result.success ? "PROCESSED" : "FAILED",
            isIndexed: result.success,
            metadata: {
              indexName: result.indexName,
              chunksCreated: result.chunksCreated,
            },
          },
        });

        console.log(`Document ${document.id} processed successfully`);
      } catch (processingError) {
        console.error("Error processing document:", processingError);

        // Update document status to failed
        await prisma.document.update({
          where: { id: document.id },
          data: {
            status: "FAILED",
            isIndexed: false,
          },
        });
      }
    } catch (error: any) {
      console.error("Error completing document upload:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to complete document upload",
        error: error.message,
      });
    }
  }
);

// Get all documents for current user
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user!.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const documents = await prisma.document.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        documents,
      });
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents",
        error: error.message,
      });
    }
  }
);

// Get documents for a specific conversation
router.get(
  "/conversation/:conversationId",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Verify the conversation exists and belongs to the user
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      const documents = await prisma.document.findMany({
        where: {
          conversationId,
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        documents,
      });
    } catch (error: any) {
      console.error("Error fetching conversation documents:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch conversation documents",
        error: error.message,
      });
    }
  }
);

// Get the main document for a conversation
router.get(
  "/conversation/:conversationId/main",
  authenticate,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Verify the conversation exists and belongs to the user
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      // Get the main document for this conversation
      const mainDocument = await prisma.document.findFirst({
        where: {
          conversationId,
          userId,
          isMainDocument: true,
        },
      });

      if (!mainDocument) {
        return res.status(404).json({
          success: false,
          message: "No main document found for this conversation",
        });
      }

      return res.status(200).json({
        success: true,
        document: mainDocument,
      });
    } catch (error: any) {
      console.error("Error fetching main document:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch main document",
        error: error.message,
      });
    }
  }
);

// Set a document as the main document
router.post("/set-main/:id", authenticate, setMainDocument);

export default router;

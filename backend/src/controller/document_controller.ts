import { Request, Response } from "express";
import { prisma } from "../db/db";
import { embedPdf } from "../ai/embedding";
import * as fs from "fs";
import * as path from "path";

/**
 * Set a document as the main document for a conversation
 */
export const setMainDocument = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // Document ID
    const userId = req.user!.id;

    // Find the document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        conversation: {
          userId
        }
      },
      include: {
        conversation: true
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or access denied"
      });
    }

    const conversationId = document.conversationId;

    // Reset isMainDocument for all documents in the conversation
    await prisma.document.updateMany({
      where: {
        conversationId
      },
      data: {
        isMainDocument: false
      }
    });

    // Set the selected document as main
    await prisma.document.update({
      where: {
        id
      },
      data: {
        isMainDocument: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Document set as main document",
      documentId: id
    });
  } catch (error: any) {
    console.error("Error setting main document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set main document",
      error: error.message
    });
  }
}; 
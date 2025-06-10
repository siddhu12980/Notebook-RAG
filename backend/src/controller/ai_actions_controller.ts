import { Request, Response } from "express";
import { prisma } from "../db/db";
import { ChatOpenAI } from "@langchain/openai";
import { vectorStore, searchDocuments } from "../ai/embedding";

// Initialize the LLM
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2,
});

/**
 * Generate a summary for a document
 */
export const generateSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { documentId } = req.body;

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
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

    // Check if summary already exists
    const existingSummary = await prisma.documentNote.findFirst({
      where: {
        documentId,
        type: "SUMMARY"
      }
    });

    if (existingSummary) {
      return res.status(200).json({
        success: true,
        summary: existingSummary,
        message: "Summary already exists"
      });
    }

    // Get document content from vector store
    const conversationId = document.conversationId;
    
    const documentChunks = await searchDocuments(
      "document overview", // Generic query to get document content
      { 
        userId, 
        conversationId,
        // documentId TODO: Add documentId to the query
      },
      10 // Get more chunks for better coverage
    );

    if (!documentChunks || documentChunks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document content not found in the vector store"
      });
    }

    // Combine document chunks
    const documentContent = documentChunks.map(chunk => chunk.pageContent).join("\n");

    // Generate summary
    const summaryPrompt = `
    You are an expert summarizer. Create a concise but comprehensive summary of the following document.
    Focus on the main ideas, key points, and conclusions. The summary should be well-structured and
    helpful for someone who wants to quickly understand what the document is about.
    
    DOCUMENT CONTENT:
    ${documentContent}
    
    SUMMARY:
    `;

    const summaryResponse = await llm.invoke(summaryPrompt);
    const summaryText = summaryResponse.content;

    // Save the summary
    const summary = await prisma.documentNote.create({
      data: {
        title: `Summary of ${document.originalName || document.filename}`,
        content: summaryText.toString(),
        type: "SUMMARY",
        documentId: document.id,
        userId
      }
    });

    return res.status(201).json({
      success: true,
      summary,
      message: "Summary generated successfully"
    });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message
    });
  }
};

/**
 * Generate study notes for a document
 */
export const generateStudyNotes = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { documentId } = req.body;

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
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

    // Check if study notes already exist
    const existingNotes = await prisma.documentNote.findFirst({
      where: {
        documentId,
        type: "STUDY_NOTES"
      }
    });

    if (existingNotes) {
      return res.status(200).json({
        success: true,
        notes: existingNotes,
        message: "Study notes already exist"
      });
    }

    // Get document content from vector store
    const conversationId = document.conversationId;
    const documentChunks = await searchDocuments(
      "document content for study", 
      { 
        userId, 
        conversationId,
        // documentId TODO: Add documentId to the query
      },
      10
    );

    if (!documentChunks || documentChunks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document content not found in the vector store"
      });
    }

    // Combine document chunks
    const documentContent = documentChunks.map(chunk => chunk.pageContent).join("\n");

    // Generate study notes
    const notesPrompt = `
    You are an expert educator. Create well-structured, educational study notes from the following document content.
    Format the notes as bullet points with clear categories and headings. Focus on key concepts, definitions, 
    and important relationships. Make the notes easy to scan and learn from.
    
    DOCUMENT CONTENT:
    ${documentContent}
    
    STUDY NOTES:
    `;

    const notesResponse = await llm.invoke(notesPrompt);
    const notesText = notesResponse.content;

    // Save the study notes
    const notes = await prisma.documentNote.create({
      data: {
        title: `Study Notes for ${document.originalName || document.filename}`,
        content: notesText.toString(),
        type: "STUDY_NOTES",
        documentId: document.id,
        userId
      }
    });

    return res.status(201).json({
      success: true,
      notes,
      message: "Study notes generated successfully"
    });
  } catch (error: any) {
    console.error("Error generating study notes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate study notes",
      error: error.message
    });
  }
};

/**
 * Save a user note
 */
export const saveUserNote = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { documentId, title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or access denied"
      });
    }

    // Save the user note
    const note = await prisma.documentNote.create({
      data: {
        title,
        content,
        type: "USER_NOTE",
        documentId: document.id,
        userId
      }
    });

    return res.status(201).json({
      success: true,
      note,
      message: "Note saved successfully"
    });
  } catch (error: any) {
    console.error("Error saving user note:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save note",
      error: error.message
    });
  }
};

/**
 * Get all notes for a document
 */
export const getDocumentNotes = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { documentId } = req.params;

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or access denied"
      });
    }

    // Get all notes for the document
    const notes = await prisma.documentNote.findMany({
      where: {
        documentId,
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log("notes", notes);

    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error: any) {
    console.error("Error fetching document notes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message
    });
  }
}; 
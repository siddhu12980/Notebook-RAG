import { Request, Response } from "express";
import { prisma } from "../db/db";
import { chatwithRagModel } from "../ai";

/**
 * Create a new conversation
 */
export const createConversation = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { title = "New Conversation" } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            documents: true,
            messages: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
};

/**
 * Update a conversation's title
 */
export const updateConversation = async (req: Request, res: Response) : Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title } = req.body;

    // Check if conversation exists and belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Update the conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { title },
    });

    return res.status(200).json({
      success: true,
      conversation: updatedConversation,
    });
  } catch (error: any) {
    console.error("Error updating conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update conversation",
      error: error.message,
    });
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (req: Request, res: Response) : Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if conversation exists and belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message,
    });
  }
};

/**
 * Add a message to a conversation
 */
export const addMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content, role = "user" } = req.body;

    // Check if conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        documents: {
          where: {
            status: "PROCESSED"
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
    }

    // Add the message
    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId: id,
      },
    });

    // Update the conversation's updatedAt field
    await prisma.conversation.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // If this is a user message, generate an AI response
    let aiMessage = null;
    if (role === "user") {
      try {
        let aiContent = "";
        
        // Use RAG if the conversation has documents
        if (conversation.documents && conversation.documents.length > 0) {
          // Use RAG to generate response
          aiContent = await chatwithRagModel(content, userId, id);
        } else {
          // Fallback response if no documents are available
          aiContent = `I don't have any documents to reference for this conversation. Please upload documents for me to provide context-based answers.`;
        }
        
        // Create the AI message in the database
        aiMessage = await prisma.message.create({
          data: {
            content: aiContent,
            role: "assistant",
            conversationId: id,
          },
        });
      } catch (aiError) {
        console.error("Error generating AI response:", aiError);
        // We don't return an error here since the user message was still saved
      }
    }

    return res.status(201).json({
      success: true,
      message,
      aiMessage,
    });
  } catch (error: any) {
    console.error("Error adding message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add message",
      error: error.message,
    });
  }
}; 
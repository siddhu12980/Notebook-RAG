import api from "./api";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

export interface Document {
  id: string;
  filename: string;
  originalName?: string;
  fileType: string;
  status: string;
  isMainDocument: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  documents: Document[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
    documents: number;
  };
}

/**
 * Create a new conversation
 */
export const createConversation = async (
  title?: string
): Promise<Conversation> => {
  try {
    console.log("Creating conversation");
    const response = await api.post("/conversations", { title });

    console.log(response.data);

    return response.data.conversation;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create conversation"
    );
  }
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<ConversationSummary[]> => {
  try {
    const response = await api.get("/conversations");
    return response.data.conversations;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversations"
    );
  }
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.get(`/conversations/${id}`);
    return response.data.conversation;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation"
    );
  }
};

/**
 * Update a conversation
 */
export const updateConversation = async (
  id: string,
  title: string
): Promise<Conversation> => {
  try {
    const response = await api.put(`/conversations/${id}`, { title });
    return response.data.conversation;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update conversation"
    );
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/conversations/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete conversation"
    );
  }
};

/**
 * Add a message to a conversation
 */
export interface MessageResponse {
  message: Message;
  aiMessage: Message | null;
}

export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<MessageResponse> => {
  try {
    const response = await api.post(
      `/conversations/${conversationId}/messages`,
      {
        content,
        role: "user",
      }
    );
    return {
      message: response.data.message,
      aiMessage: response.data.aiMessage,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};

/**
 * Upload a document to a conversation
 */
export const uploadDocument = async (formData: FormData): Promise<any> => {
  const conversationId = formData.get("conversationId") as string;

  // For new conversations, create a conversation first
  if (conversationId === "new") {
    const conversation = await createConversation();
    formData.set("conversationId", conversation.id);
  }

  try {
    const response = await api.post(
      `/conversations/${formData.get("conversationId")}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to upload document");
  }
};

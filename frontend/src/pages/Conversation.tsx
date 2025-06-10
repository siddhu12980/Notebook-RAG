import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getConversation,
  sendMessage,
  createConversation,
  updateConversation,
} from "../services/conversationService";
import type {
  MessageResponse,
  Conversation as ConversationType,
  Message,
} from "../services/conversationService";

// Layout components
import ConversationLayout from "../components/layout/ConversationLayout";
import ConversationHeader from "../components/conversation/ConversationHeader";
import DocumentsSidebar from "../components/conversation/DocumentsSidebar";
import ActionsSidebar from "../components/conversation/ActionsSidebar";
import ChatArea from "../components/conversation/ChatArea";

const Conversation = () => {
  const { id } = useParams<{ id: string }>();

  console.log(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<any>(null);

  const [activeNoteDisplayLocation, setActiveNoteDisplayLocation] = useState<
    "left" | "right"
  >("right");

  console.log(setActiveNoteDisplayLocation, activeNoteDisplayLocation);

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  console.error("id", id);

  const createConversationMutation = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: (newConversation) => {
      navigate(`/conversation/${newConversation.id}`, { replace: true });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create conversation: ${error.message}`);
    },
  });

  useEffect(() => {
    if (id === "new") {
      createConversationMutation.mutate();
    }
  }, [id]);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getConversation(id as string),
    enabled: !!id && id !== "new" && !createConversationMutation.isPending,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (id && id !== "new" && !createConversationMutation.isPending) {
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    }
  }, [id, queryClient, createConversationMutation.isPending]);

  useEffect(() => {
    if (conversation?.messages) {
      setOptimisticMessages(conversation.messages);
    }
  }, [conversation?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: ({
      content,
      conversationId,
    }: {
      content: string;
      conversationId: string;
    }) => {
      return sendMessage(conversationId, content);
    },
  });

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !id ||
      id === "new" ||
      createConversationMutation.isPending
    )
      return;

    // Create optimistic user message
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: message,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    setOptimisticMessages((prev) => [...prev, optimisticUserMessage]);

    setMessage("");
    setSelectedTool(null);

    // Actually send the message
    sendMessageMutation.mutate(
      {
        content: message,
        conversationId: id,
      },
      {
        onSuccess: (data: MessageResponse) => {
          setOptimisticMessages((prevMessages) => {
            const updatedMessages = prevMessages.map((msg) =>
              msg.id.includes("temp-") ? data.message : msg
            );

            if (data.aiMessage) {
              return [...updatedMessages, data.aiMessage];
            }

            return updatedMessages;
          });

          queryClient.invalidateQueries({ queryKey: ["conversation", id] });
        },
        onError: (error: Error) => {
          toast.error(`Failed to send message: ${error.message}`);
        },
      }
    );
  };

  const handleDocumentUpload = (uploadResult: any) => {
    if (uploadResult.success) {
      toast.success(
        `Document uploaded and processed: ${uploadResult.filename}`
      );

      // Refresh the conversation data to include the new document
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });

      // Force refetch after a short delay to ensure the document is available
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["conversation", id] });

        // After refetching, check if we need to update the conversation title
        if (id) {
          getConversation(id)
            .then((refreshedConversation) => {
              const mainDoc = refreshedConversation.documents.find(
                (doc) => doc.isMainDocument
              );

              // If there's a main document with an original name, update the conversation title
              if (
                mainDoc &&
                mainDoc.originalName &&
                (refreshedConversation.title === "New Conversation" ||
                  refreshedConversation.title.startsWith("Conversation"))
              ) {
                // Extract filename without extension for a cleaner title
                const fileName = mainDoc.originalName
                  .split(".")
                  .slice(0, -1)
                  .join(".");
                const newTitle = fileName || mainDoc.originalName;

                // Update conversation title
                updateConversation(id, newTitle)
                  .then((_) => {
                    queryClient.invalidateQueries({
                      queryKey: ["conversation", id],
                    });
                  })
                  .catch((error) => {
                    console.error("Error updating conversation title:", error);
                  });
              }
            })
            .catch((error) => {
              console.error(
                "Error fetching conversation after document upload:",
                error
              );
            });
        }
      }, 1000);
    }
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(selectedTool === tool ? null : tool);
  };

  const handleNoteSelect = (note: any) => {
    setActiveNote(note);
  };

  const handleNoteClose = () => {
    setActiveNote(null);
  };

  // Default conversation data for new conversations
  const defaultConversation: ConversationType = {
    id: id || "new",
    title: "New Conversation",
    messages: [],
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Use default data for new conversations
  const currentConversation = conversation || defaultConversation;

  // Get all documents from the conversation
  const documents = currentConversation.documents || [];

  return (
    <ConversationLayout
      header={
        <ConversationHeader
          title={currentConversation.title}
          conversationId={currentConversation.id}
        />
      }
      leftSidebar={
        <DocumentsSidebar
          conversationId={id !== "new" ? id : undefined}
          onUpload={handleDocumentUpload}
        />
      }
      mainContent={
        <ChatArea
          messages={optimisticMessages}
          messageText={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          isLoading={sendMessageMutation.isPending}
        />
      }
      rightSidebar={
        <>
          {activeNoteDisplayLocation === "right" && activeNote ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {activeNote.type}
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-300"
                  onClick={handleNoteClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <h3 className="text-md font-medium text-purple-400 mb-2">
                {activeNote.title}
              </h3>
              <div className="bg-gray-800 rounded-md p-4 flex-1 overflow-y-auto">
                <div className="prose prose-invert prose-sm max-w-none">
                  {activeNote.content
                    .split("\n")
                    .map((paragraph: string, idx: number) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <ActionsSidebar
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              generatedNotes={[]}
              onNoteSelect={handleNoteSelect}
              documents={documents}
            />
          )}
        </>
      }
      activeNoteVisible={
        activeNoteDisplayLocation === "right" && activeNote !== null
      }
    />
  );
};

export default Conversation;

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getConversation,
  updateConversation,
} from "../../services/conversationService";
import api from "../../services/api";
import type { Document } from "../../services/conversationService";

interface DocumentListProps {
  conversationId: string;
  onDocumentSelect?: (document: Document) => void;
}

export const DocumentList = ({ conversationId }: DocumentListProps) => {
  const queryClient = useQueryClient();

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 0, // Don't cache the data to ensure fresh documents
  });

  // Safe access to documents array
  const documents = conversation?.documents || [];

  // Debug log
  console.log("Documents in DocumentList:", documents);

  const mainDocument = Array.isArray(documents)
    ? documents.find((doc) => doc.isMainDocument)
    : undefined;

  // Set a document as the main document
  const setAsMainDocument = async (documentId: string) => {
    try {
      await api.post(`/documents/set-main/${documentId}`);

      toast.success("Document set as main document");

      // Invalidate the conversation query to refresh documents
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });

      // Update conversation title based on the new main document
      setTimeout(async () => {
        // Get the updated conversation data
        const updatedConversation = await getConversation(conversationId);

        // Find the new main document
        const newMainDoc = updatedConversation.documents.find(
          (doc) => doc.isMainDocument
        );

        if (newMainDoc && newMainDoc.originalName) {
          // Only update if the current title is generic or empty
          if (
            updatedConversation.title === "New Conversation" ||
            updatedConversation.title.startsWith("Conversation") ||
            !updatedConversation.title.trim()
          ) {
            // Extract filename without extension for a cleaner title
            const fileName = newMainDoc.originalName
              .split(".")
              .slice(0, -1)
              .join(".");
            const newTitle = fileName || newMainDoc.originalName;

            // Update the conversation title
            await updateConversation(conversationId, newTitle);

            // Refresh the conversation data
            queryClient.invalidateQueries({
              queryKey: ["conversation", conversationId],
            });

            toast.success(`Conversation title updated to: ${newTitle}`);
          }
        }
      }, 1000); // Give time for the backend to update
    } catch (error) {
      toast.error("Failed to set main document");
      console.error("Error setting main document:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading documents...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error loading documents</div>;
  }

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return <div className="p-4 text-gray-400">No documents found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Main document section */}
      {mainDocument && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Main Document
          </h3>
          <div
            className={`p-3 rounded-md border cursor-pointer transition-colors
              ${"bg-purple-900/30 border-purple-600"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-purple-400 truncate">
                {mainDocument.originalName || mainDocument.filename}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/50 text-purple-300">
                Main
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{new Date(mainDocument.createdAt).toLocaleString()}</span>
              <span
                className={`px-1.5 py-0.5 rounded-sm ${
                  mainDocument.status === "PROCESSED"
                    ? "bg-green-900/20 text-green-400"
                    : mainDocument.status === "PROCESSING"
                    ? "bg-yellow-900/20 text-yellow-400"
                    : mainDocument.status === "FAILED"
                    ? "bg-red-900/20 text-red-400"
                    : "bg-gray-700/50 text-gray-400"
                }`}
              >
                {mainDocument.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Other documents */}
      {Array.isArray(documents) &&
        documents.filter((doc) => !doc.isMainDocument).length > 0 && (
          <>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Other Documents
            </h3>
            <div className="space-y-2">
              {documents
                .filter((doc) => !doc.isMainDocument)
                .map((document) => (
                  <div
                    key={document.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors
                    ${"bg-gray-800 border-gray-700 hover:bg-gray-750"}`}
                  >
                    {/* Document content */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300 truncate">
                        {document.originalName || document.filename}
                      </span>
                      <button
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMainDocument(document.id);
                        }}
                      >
                        Set as main
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {new Date(document.createdAt).toLocaleString()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-sm ${
                          document.status === "PROCESSED"
                            ? "bg-green-900/20 text-green-400"
                            : document.status === "PROCESSING"
                            ? "bg-yellow-900/20 text-yellow-400"
                            : document.status === "FAILED"
                            ? "bg-red-900/20 text-red-400"
                            : "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {document.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
    </div>
  );
};

export default DocumentList;

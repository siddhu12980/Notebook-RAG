import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  deleteConversation,
  updateConversation,
} from "../services/conversationService";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import type { ConversationSummary } from "../services/conversationService";

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Update conversation title mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Title updated successfully");
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update title: ${error.message}`);
    },
  });

  const handleSignOut = () => {
    clearAuth();
  };

  const handleStartNewConversation = () => {
    navigate("/conversation/new");
  };

  const handleConversationClick = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (
    e: React.MouseEvent,
    conversation: ConversationSummary
  ) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setNewTitle(conversation.title || "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTitle.trim()) {
      updateMutation.mutate({ id, title: newTitle.trim() });
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">RAG Notebook</h1>

          <div className="flex items-center space-x-4">
            <span className="text-gray-300 bg-gray-700 px-3 py-1 rounded-full text-sm">
              {user?.email}
            </span>

            <button onClick={handleSignOut} className="btn btn-outline text-sm">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-100">
            Your Conversations
          </h2>

          <div className="flex flex-row  items-center gap-2  cursor-pointer">
            <div
              onClick={handleStartNewConversation}
              className="btn btn-primary flex flex-row items-center gap-2"
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div>
                <span className="inline-flex items-center">
                  New Conversation
                </span>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading your conversations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-900/20 rounded-lg border border-red-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-red-300">Failed to load conversations</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn btn-outline border-red-700 hover:bg-red-800/50 text-red-300"
            >
              Try again
            </button>
          </div>
        ) : conversations?.length === 0 ? (
          <div className="text-center py-16 card p-8">
            <div className="mb-6 bg-purple-500/10 p-4 rounded-full inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-100 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start your first conversation by uploading documents and asking
              questions
            </p>
            <button
              onClick={handleStartNewConversation}
              className="btn btn-primary"
            >
              <span className="inline-flex items-center">
                Start a new conversation
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations?.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="card p-6 cursor-pointer hover:bg-gray-750 transition-all border-2 border-transparent hover:border-purple-600/50 group relative"
              >
                {editingId === conversation.id ? (
                  <form
                    onSubmit={(e) => handleTitleSave(e, conversation.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mb-2"
                  >
                    <input
                      type="text"
                      value={newTitle}
                      onChange={handleTitleChange}
                      className="w-full bg-gray-800 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/30 mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-sm btn-primary">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn btn-sm btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <h3 className="text-lg font-medium text-gray-100 mb-2 truncate group-hover:text-purple-400 transition-colors">
                    {conversation.title || "Untitled Conversation"}
                  </h3>
                )}

                <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                  Start a conversation with this document
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-700">
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    {conversation._count.messages} messages
                  </span>
                </div>

                {/* Action buttons - only visible on hover */}
                {editingId !== conversation.id && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => handleEditClick(e, conversation)}
                      className="p-1.5 rounded-full bg-gray-700/70 hover:bg-gray-600 text-gray-300"
                      title="Edit title"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, conversation.id)}
                      className="p-1.5 rounded-full bg-red-900/70 hover:bg-red-800 text-red-300"
                      title="Delete conversation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

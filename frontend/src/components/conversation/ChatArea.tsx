import { useRef, useEffect, useState } from "react";
import type { Message as ServiceMessage } from "../../services/conversationService";

// Message type used by ChatArea
type Message = ServiceMessage;

type ChatAreaProps = {
  messages: Message[];
  messageText: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export const ChatArea = ({
  messages,
  messageText,
  onMessageChange,
  onSendMessage,
  isLoading,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Store the local messages array for optimistic updates
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  // Update local messages when props messages change
  useEffect(() => {
    setLocalMessages(messages);
    setIsTyping(isLoading);
  }, [messages, isLoading]);

  // Scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, isTyping]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [messageText]);

  // Handle form submission with optimistic updates
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || isLoading) return;

    // Create an optimistic user message
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageText,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    // Update UI immediately
    setLocalMessages((prev) => [...prev, optimisticUserMessage]);
    setIsTyping(true);

    // Clear input
    onMessageChange("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Actually send the message
    onSendMessage(e);
  };

  // Handle key press in the message input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
        <div className="max-w-3xl mx-auto">
          {localMessages && localMessages.length > 0 ? (
            <div className="space-y-6">
              {localMessages.map((msg) => {
                // Skip rendering typing indicator messages in the regular message list
                if (msg.id.includes("temp-typing")) return null;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-100 border border-gray-700"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.role === "assistant" && msg.content !== "..." && (
                        <div className="mt-2 text-xs text-purple-300 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
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
                          <span>Powered by document context</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* AI is typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-150"></div>
                      <span className="text-sm text-gray-400 ml-1">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-12 glass-card p-8 rounded-lg shadow-md">
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
                Start the conversation
              </h3>
              <p className="text-gray-400 mb-4">
                Upload documents and ask questions about them
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-700 p-4 bg-gray-800 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end rounded-lg border border-gray-700 bg-gray-750 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                className="flex-1 bg-transparent border-0 py-3 px-4 focus:ring-0 resize-none max-h-[150px] min-h-[56px]"
                rows={1}
                disabled={isLoading}
              />
              <div className="pr-2 pb-2">
                <button
                  type="submit"
                  disabled={!messageText.trim() || isLoading}
                  className={`p-2 rounded-lg ${
                    messageText.trim() && !isLoading
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Tool and hints display */}
            <div className="mt-2 flex justify-between">
              <span className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

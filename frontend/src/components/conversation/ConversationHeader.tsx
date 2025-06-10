import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateConversation } from '../../services/conversationService';
import { toast } from 'sonner';

type ConversationHeaderProps = {
  title: string;
  conversationId: string;
};

export const ConversationHeader = ({ title, conversationId }: ConversationHeaderProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => 
      updateConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      toast.success('Title updated');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update title: ${error.message}`);
    }
  });

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEditClick = () => {
    setNewTitle(title);
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && conversationId !== 'new') {
      updateMutation.mutate({ id: conversationId, title: newTitle.trim() });
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {isEditing ? (
          <form onSubmit={handleTitleSave} className="flex items-center">
            <input
              type="text"
              value={newTitle}
              onChange={handleTitleChange}
              className="bg-gray-700 text-gray-100 px-3 py-1 rounded border border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-500/30"
              autoFocus
            />
            <div className="flex ml-2">
              <button 
                type="submit" 
                className="text-green-400 p-1 hover:text-green-300"
                title="Save"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="text-gray-400 p-1 hover:text-gray-300"
                title="Cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center">
            <h1 className="text-xl font-medium">{title || "New Conversation"}</h1>
            {conversationId !== 'new' && (
              <button 
                onClick={handleEditClick}
                className="ml-2 text-gray-400 p-1 hover:text-gray-300 rounded-full hover:bg-gray-700"
                title="Edit title"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader; 
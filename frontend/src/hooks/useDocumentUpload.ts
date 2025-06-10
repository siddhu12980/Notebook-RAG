import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadDocument } from '../services/documentService';

interface UseDocumentUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  conversationId?: string;
}

export function useDocumentUpload(options?: UseDocumentUploadOptions) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        
        // Mock progress updates since we don't get real-time progress with presigned URLs
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            // Randomly increase progress but never reach 100% until complete
            const nextProgress = Math.min(prev + Math.random() * 10, 95);
            return nextProgress;
          });
        }, 500);
        
        // Perform the actual upload
        const result = await uploadDocument(file, options?.conversationId);
        
        // Clear interval and set to 100% when done
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return result;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  const handleFileUpload = async (file: File) => {
    return uploadMutation.mutate(file);
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      await handleFileUpload(file);
    }
  };

  return {
    uploadDocument: handleFileUpload,
    uploadDocuments: handleFilesUpload,
    uploadProgress,
    isUploading,
    ...uploadMutation,
  };
} 
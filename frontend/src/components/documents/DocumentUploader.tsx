import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

interface DocumentUploaderProps {
  onUploadSuccess?: (data: any) => void;
  className?: string;
  conversationId?: string;
}

export const DocumentUploader = ({ 
  onUploadSuccess, 
  className = '',
  conversationId
}: DocumentUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    uploadDocuments, 
    uploadProgress, 
    isUploading, 
    isPending 
  } = useDocumentUpload({
    conversationId,
    onSuccess: (data) => {
      toast.success('Document uploaded successfully');
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    // Filter for PDFs only
    const validFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (validFiles.length === 0) {
      toast.error('Only PDF files are supported');
      return;
    }
    
    if (validFiles.length !== files.length) {
      toast.warning(`${files.length - validFiles.length} files were skipped because they are not PDFs`);
    }
    
    uploadDocuments(validFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-purple-500 bg-purple-100/10' 
            : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
          }
          ${isUploading || isPending ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf"
          multiple
        />
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        {isUploading || isPending ? (
          <div className="w-full max-w-xs">
            <div className="text-sm text-gray-300 mb-1 flex justify-between">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-gray-400 text-xs mt-1">PDF files only (max 10MB)</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader; 
import api from './api';

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

interface DocumentUploadResponse {
  success: boolean;
  documentId?: string;
  message: string;
  key?: string;
  isMainDocument?: boolean;
}

/**
 * Request a presigned URL for uploading a document
 * @param filename Original filename
 * @param contentType MIME type of the file
 * @param conversationId Optional ID of the conversation to associate with the document
 */
export const getPresignedUploadUrl = async (
  filename: string,
  contentType: string,
  conversationId?: string
): Promise<UploadUrlResponse> => {
  try {
    const response = await api.post('/documents/presigned-upload', {
      filename,
      contentType,
      conversationId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get upload URL');
  }
};

/**
 * Upload a file directly to S3 using a presigned URL
 * @param uploadUrl Presigned S3 URL
 * @param file File to upload
 * @param contentType MIME type of the file
 */
export const uploadToS3 = async (
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  try {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to storage');
  }
};

/**
 * Complete the document upload process by notifying the backend
 * @param key S3 object key
 * @param filename Original filename
 * @param conversationId Optional ID of the conversation to associate with the document
 */
export const completeDocumentUpload = async (
  key: string,
  filename: string,
  conversationId?: string
): Promise<DocumentUploadResponse> => {
  try {
    const response = await api.post('/documents/complete-upload', {
      key,
      filename,
      conversationId,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to complete upload');
  }
};

/**
 * Upload a document using the presigned URL workflow
 * @param file File to upload
 * @param conversationId Optional ID of the conversation to associate with the document
 */
export const uploadDocument = async (
  file: File,
  conversationId?: string
): Promise<DocumentUploadResponse> => {
  try {
    // Step 1: Get presigned URL
    const { uploadUrl, key } = await getPresignedUploadUrl(
      file.name,
      file.type,
      conversationId
    );

    // Step 2: Upload directly to S3
    await uploadToS3(uploadUrl, file, file.type);

    // Step 3: Complete the upload process
    const result = await completeDocumentUpload(key, file.name, conversationId);
    
    return result;
  } catch (error: any) {
    console.error('Document upload failed:', error);
    return {
      success: false,
      message: error.message || 'Document upload failed',
    };
  }
}; 
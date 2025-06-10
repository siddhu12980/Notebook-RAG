import api from './api';

export interface DocumentNote {
  id: string;
  title: string;
  content: string;
  type: 'SUMMARY' | 'STUDY_NOTES' | 'USER_NOTE';
  createdAt: string;
  updatedAt: string;
  documentId: string;
  userId: string;
}

/**
 * Generate a summary for a document
 */
export const generateSummary = async (documentId: string): Promise<DocumentNote> => {
  try {
    const response = await api.post('/ai-actions/generate-summary', { documentId });
    return response.data.summary;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to generate summary');
  }
};

/**
 * Generate study notes for a document
 */
export const generateStudyNotes = async (documentId: string): Promise<DocumentNote> => {
  try {
    const response = await api.post('/ai-actions/generate-study-notes', { documentId });
    return response.data.notes;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to generate study notes');
  }
};

/**
 * Save a user note for a document
 */
export const saveUserNote = async (
  documentId: string,
  title: string,
  content: string
): Promise<DocumentNote> => {
  try {
    const response = await api.post('/ai-actions/save-user-note', {
      documentId,
      title,
      content
    });
    return response.data.note;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to save note');
  }
};

/**
 * Get all notes for a document
 */
export const getDocumentNotes = async (documentId: string): Promise<DocumentNote[]> => {
  try {
    const response = await api.get(`/ai-actions/notes/${documentId}`);
    return response.data.notes;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notes');
  }
}; 
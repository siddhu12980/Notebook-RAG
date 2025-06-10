import React, { useState } from 'react';
import type { Document } from '@/services/conversationService';
import { DocumentNotes } from '@/components/DocumentNotes';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FileDigit, BookOpen } from 'lucide-react';

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [activeTab, setActiveTab] = useState('document');

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-200">
          {document.originalName || document.filename}
        </h2>
        <p className="text-sm text-gray-400">
          Uploaded on {new Date(document.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="flex-1 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <FileDigit className="h-12 w-12 mx-auto mb-2" />
                  <p>Document preview is not available yet.</p>
                  <p className="text-sm mt-2">Use the chat interface to ask questions about this document.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
          <DocumentNotes 
            documentId={document.id} 
            documentName={document.originalName || document.filename} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentViewer; 
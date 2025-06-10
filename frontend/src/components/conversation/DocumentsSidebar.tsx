import DocumentUploader from "../documents/DocumentUploader";
import DocumentList from "./DocumentList";

type DocumentsSidebarProps = {
  conversationId?: string;
  onUpload: (data: any) => void;
};

export const DocumentsSidebar = ({
  conversationId,
  onUpload,
}: DocumentsSidebarProps) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-medium text-gray-200 mb-4">Documents</h2>

      <DocumentUploader
        onUploadSuccess={onUpload}
        className="mb-5"
        conversationId={conversationId}
      />

      <div className="mt-4 flex-1 overflow-y-auto">
        {conversationId ? (
          <DocumentList conversationId={conversationId} key={conversationId} />
        ) : (
          <div className="bg-gray-750/50 p-4 rounded-md border border-gray-700">
            <div className="text-gray-400 text-xs italic">
              Start a conversation to see documents
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsSidebar;

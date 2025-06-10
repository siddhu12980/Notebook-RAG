import React from 'react';
import type { DocumentNote } from '@/services/aiActionsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface SummaryViewProps {
  summary: DocumentNote;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({ 
  summary, 
  onRegenerate,
  isRegenerating = false 
}) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.content);
    toast.success('Summary copied to clipboard');
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-200">{summary.title}</h3>
          <div className="flex gap-2">
            {onRegenerate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2">
          Generated on {summary.createdAt}
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-200 prose-p:text-gray-300 prose-strong:text-gray-200 prose-ul:text-gray-300 mt-4">
          {isRegenerating ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-purple-400" />
              <p className="text-gray-300">Regenerating summary...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert text-white prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-a:text-blue-400 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200">
              <ReactMarkdown>{summary.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryView; 
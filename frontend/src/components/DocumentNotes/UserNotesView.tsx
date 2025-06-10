import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { DocumentNote } from "@/services/aiActionsService";
import { saveUserNote } from "@/services/aiActionsService";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface UserNotesViewProps {
  notes: DocumentNote[];
  documentId: string;
  onNoteSaved?: (note: DocumentNote) => void;
}

const UserNotesView: React.FC<UserNotesViewProps> = ({
  notes,
  documentId,
  onNoteSaved,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newNote = await saveUserNote(documentId, title, content);
      toast.success("Note saved successfully");
      setTitle("");
      setContent("");
      setIsCreating(false);
      onNoteSaved && onNoteSaved(newNote);
    } catch (error: any) {
      toast.error(error.message || "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(selectedNoteId === noteId ? null : noteId);
  };

  return (
    <div className="space-y-4">
      {!isCreating && (
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="w-full bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Note
        </Button>
      )}

      {isCreating && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <Input
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Write your notes here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="bg-gray-900/50 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save Note
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && !isCreating ? (
        <div className="text-center py-4 text-gray-400">
          You haven't added any notes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={`cursor-pointer transition-all bg-gray-800/50 border-gray-700 hover:bg-gray-750 ${
                selectedNoteId === note.id ? "ring-1 ring-purple-500" : ""
              }`}
              onClick={() => handleNoteClick(note.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-medium text-gray-200">
                    {note.title}
                  </h3>
                </div>
                <div className="text-xs text-gray-400 mt-1 mb-2">
                  {formatDate(note.createdAt)}
                </div>
                {selectedNoteId === note.id ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-a:text-blue-400 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200 mt-2">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {note.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotesView;

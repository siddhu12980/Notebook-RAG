import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, FileText, BookOpen, Pencil } from "lucide-react";

import {
  getDocumentNotes,
  generateSummary,
  generateStudyNotes,
  type DocumentNote,
} from "@/services/aiActionsService";

import SummaryView from "./SummaryView";
import StudyNotesView from "./StudyNotesView";
import UserNotesView from "./UserNotesView";
import { toast } from "sonner";

interface DocumentNotesProps {
  documentId: string;
  documentName: string;
}

const DocumentNotes: React.FC<DocumentNotesProps> = ({
  documentId,
  documentName,
}) => {
  const [notes, setNotes] = useState<DocumentNote[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingStudyNotes, setGeneratingStudyNotes] = useState(false);

  // Get summary note
  const summaryNote = notes.find((note) => note.type === "SUMMARY");
  
  // Get study notes
  const studyNote = notes.find((note) => note.type === "STUDY_NOTES");
  
  // Get user notes
  const userNotes = notes.filter((note) => note.type === "USER_NOTE");

  // Fetch notes on component mount and trigger summary generation if none exists
  useEffect(() => {
    const initializeNotes = async () => {
      await fetchNotes();
      
      // Auto-generate summary if it doesn't exist
      if (!notes.find(note => note.type === "SUMMARY")) {
        handleGenerateSummary();
      }
    };
    
    initializeNotes();
  }, [documentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getDocumentNotes(documentId);
      setNotes(fetchedNotes);
      return fetchedNotes;
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch notes");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // If switching to study notes tab and none exist, generate them
    if (value === "study-notes" && !studyNote && !generatingStudyNotes) {
      handleGenerateStudyNotes();
    }
  };

  const handleGenerateSummary = async () => {
    if (generatingSummary) return; // Prevent multiple calls
    
    try {
      setGeneratingSummary(true);
      const summary = await generateSummary(documentId);
      setNotes((prev) => [
        ...prev.filter((note) => note.type !== "SUMMARY"),
        summary,
      ]);
      toast.success("Summary generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateStudyNotes = async () => {
    if (generatingStudyNotes) return; // Prevent multiple calls
    
    try {
      setGeneratingStudyNotes(true);
      const studyNotes = await generateStudyNotes(documentId);
      setNotes((prev) => [
        ...prev.filter((note) => note.type !== "STUDY_NOTES"),
        studyNotes,
      ]);
      toast.success("Study notes generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate study notes");
    } finally {
      setGeneratingStudyNotes(false);
    }
  };

  const handleRegenerateContent = async (type: string) => {
    if (type === "SUMMARY") {
      handleGenerateSummary();
    } else if (type === "STUDY_NOTES") {
      handleGenerateStudyNotes();
    }
  };

  const handleNoteSaved = (newNote: DocumentNote) => {
    setNotes((prev) => [...prev, newNote]);
    toast.success("Note saved successfully");
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Notes</CardTitle>
        <CardDescription>
          AI-powered summaries, study notes, and your personal notes for {documentName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="study-notes"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Study Notes
            </TabsTrigger>
            <TabsTrigger value="user-notes" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Your Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {summaryNote ? (
              <div>
                <SummaryView 
                  summary={summaryNote} 
                  onRegenerate={() => handleRegenerateContent("SUMMARY")}
                  isRegenerating={generatingSummary}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">Generating document summary...</p>
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="study-notes">
            {studyNote ? (
              <div>
                <StudyNotesView 
                  studyNotes={studyNote} 
                  onRegenerate={() => handleRegenerateContent("STUDY_NOTES")}
                  isRegenerating={generatingStudyNotes}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">Generating study notes...</p>
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="user-notes">
            <UserNotesView
              notes={userNotes}
              documentId={documentId}
              onNoteSaved={handleNoteSaved}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DocumentNotes;

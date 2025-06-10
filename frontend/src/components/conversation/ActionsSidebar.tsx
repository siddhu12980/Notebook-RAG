import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getDocumentNotes,
  generateSummary,
  generateStudyNotes,
  type DocumentNote,
} from "@/services/aiActionsService";
import {
  SummaryView,
  StudyNotesView,
  UserNotesView,
} from "@/components/DocumentNotes";
import type { Document } from "@/services/conversationService";
import ReactMarkdown from "react-markdown";

type ActionsSidebarProps = {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
  generatedNotes: GeneratedNote[];
  onNoteSelect: (note: GeneratedNote) => void;
  documents: Document[];
};

type GeneratedNote = {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
};

export const ActionsSidebar = ({
  documents = [],
}: ActionsSidebarProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [documentNotes, setDocumentNotes] = useState<DocumentNote[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState<
    Record<string, boolean>
  >({});
  const [generatingStudyNotes, setGeneratingStudyNotes] = useState<
    Record<string, boolean>
  >({});

  console.log(isCreatingNote)

  const toggleSection = async (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
      return;
    }

    setExpandedSection(section);
    setSelectedNoteId(null);

    // When expanding summary or notes section, fetch notes for all documents
    if (
      (section === "summary" || section === "notes") &&
      documents.length > 0
    ) {
      await fetchNotesForDocuments();
    }

    // If Add Notes is selected, prepare for note creation
    if (section === "addNotes") {
      setIsCreatingNote(true);
    } else {
      setIsCreatingNote(false);
    }
  };

  // Fetch notes for all documents
  const fetchNotesForDocuments = async () => {
    if (documents.length === 0) return;

    setIsLoadingNotes(true);
    try {
      const allNotes: DocumentNote[] = [];
      for (const doc of documents) {
        try {
          const notes = await getDocumentNotes(doc.id);
          allNotes.push(...notes);
        } catch (error) {
          console.error(`Error fetching notes for document ${doc.id}:`, error);
        }
      }
      setDocumentNotes(allNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load document notes");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Generate summary for a document
  const handleGenerateSummary = async (documentId: string) => {
    if (generatingSummary[documentId]) return;

    setGeneratingSummary((prev) => ({ ...prev, [documentId]: true }));
    try {
      const summary = await generateSummary(documentId);
      setDocumentNotes((prev) => [
        ...prev.filter(
          (note) => !(note.documentId === documentId && note.type === "SUMMARY")
        ),
        summary,
      ]);
      toast.success("Summary generated successfully");
      setSelectedNoteId(summary.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setGeneratingSummary((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  // Generate study notes for a document
  const handleGenerateStudyNotes = async (documentId: string) => {
    if (generatingStudyNotes[documentId]) return;

    setGeneratingStudyNotes((prev) => ({ ...prev, [documentId]: true }));
    try {
      const studyNotes = await generateStudyNotes(documentId);
      setDocumentNotes((prev) => [
        ...prev.filter(
          (note) =>
            !(note.documentId === documentId && note.type === "STUDY_NOTES")
        ),
        studyNotes,
      ]);
      toast.success("Study notes generated successfully");
      setSelectedNoteId(studyNotes.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate study notes");
    } finally {
      setGeneratingStudyNotes((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  // Handle regenerating content
  const handleRegenerateContent = async (
    noteId: string,
    type: string,
    documentId: string
  ) => {
    console.log("Regenerating content for noteId:", noteId, "type:", type, "documentId:", documentId);
    if (type === "SUMMARY") {
      await handleGenerateSummary(documentId);
    } else if (type === "STUDY_NOTES") {
      await handleGenerateStudyNotes(documentId);
    }
  };

  // Handle saving a new user note
  const handleNoteSaved = (newNote: DocumentNote) => {
    setDocumentNotes((prev) => [...prev, newNote]);
    toast.success("Note saved successfully");
    setIsCreatingNote(false);
    setSelectedNoteId(newNote.id);
  };

  // Get summaries for all documents
  const summaries = documentNotes.filter((note) => note.type === "SUMMARY");

  // Get study notes for all documents
  const studyNotes = documentNotes.filter(
    (note) => note.type === "STUDY_NOTES"
  );

  // Get user notes for all documents
  const userNotes = documentNotes.filter((note) => note.type === "USER_NOTE");

  // Get selected note
  const selectedNote = documentNotes.find((note) => note.id === selectedNoteId);

  const tools = [
    {
      id: "summary",
      name: "Generate Summary",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      ),
    },
    {
      id: "notes",
      name: "Study Notes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "audio",
      name: "Generate Audio",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
          />
        </svg>
      ),
    },
    {
      id: "addNotes",
      name: "Add Notes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
    },
  ];

  const renderDocumentList = (type: string) => {
    if (type === "summary") {
      return (
        <div className="space-y-4">
          {documents.map((doc) => {
            const docSummary = summaries.find((s) => s.documentId === doc.id);
            const isGenerating = generatingSummary[doc.id];

            return (
              <div
                key={doc.id}
                className="bg-gray-800/50 rounded-md overflow-hidden border border-gray-700/50"
              >
                <div className="px-3 py-2 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-200">
                    {doc.originalName || doc.filename}
                  </h4>
                </div>

                {docSummary ? (
                  <div className="p-3">
                    <div
                      className="cursor-pointer text-sm text-gray-300 hover:text-gray-100"
                      onClick={() => setSelectedNoteId(docSummary.id)}
                    >
                      <div className="line-clamp-3 text-xs">
                        {docSummary.content}
                      </div>
                      <div className="text-purple-400 text-xs mt-1 hover:text-purple-300 transition-colors">
                        Click to view full summary
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    {isGenerating ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-purple-400" />
                        <span className="text-xs text-gray-400">
                          Generating summary...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateSummary(doc.id)}
                        className="w-full py-1.5 text-xs text-center bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 rounded border border-purple-800/30 hover:border-purple-700"
                      >
                        Generate Summary
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (type === "notes") {
      return (
        <div className="space-y-4">
          {documents.map((doc) => {
            const docNotes = studyNotes.find((n) => n.documentId === doc.id);
            const isGenerating = generatingStudyNotes[doc.id];

            return (
              <div
                key={doc.id}
                className="bg-gray-800/50 rounded-md overflow-hidden border border-gray-700/50"
              >
                <div className="px-3 py-2 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-200">
                    {doc.originalName || doc.filename}
                  </h4>
                </div>

                {docNotes ? (
                  <div className="p-3">
                    <div
                      className="cursor-pointer text-sm text-gray-300 hover:text-gray-100"
                      onClick={() => setSelectedNoteId(docNotes.id)}
                    >
                      <div className="line-clamp-3 text-xs">
                        {docNotes.content}
                      </div>
                      <div className="text-emerald-400 text-xs mt-1 hover:text-emerald-300 transition-colors">
                        Click to view full study notes
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    {isGenerating ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-emerald-400" />
                        <span className="text-xs text-gray-400">
                          Generating study notes...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateStudyNotes(doc.id)}
                        className="w-full py-1.5 text-xs text-center bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-300 rounded border border-emerald-800/30 hover:border-emerald-700"
                      >
                        Generate Study Notes
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Hide tools list when a section is expanded or a note is selected */}
      <div className={`${expandedSection || selectedNoteId ? "hidden" : ""}`}>
        {/* RAG Information Panel */}
        <div className="mb-6 glass-card p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <h3 className="text-md font-medium text-purple-400 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Document-Powered Chat
          </h3>
          <p className="text-xs text-gray-300 mb-2">
            Questions you ask will be answered based on the content of your
            uploaded documents, providing precise information from your files.
          </p>
          <div className="text-xs text-gray-400">
            For best results:
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Ask specific questions about your documents</li>
              <li>Upload relevant documents first</li>
              <li>Be clear about what information you need</li>
            </ul>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-200 mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Actions
        </h2>

        {/* Tools Section */}
        <div className="space-y-2 mb-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => toggleSection(tool.id)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                expandedSection === tool.id
                  ? "bg-purple-900/50 text-purple-300"
                  : "hover:bg-gray-750 text-gray-300"
              }`}
            >
              {tool.icon}
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* Document Content Sections */}
      <div className={`${expandedSection || selectedNoteId ? "mt-0" : "mt-4"} flex-1 overflow-y-auto`}>
        {/* Show back to tools button when a section is expanded */}
        {(expandedSection || selectedNoteId) && !selectedNote && (
          <div className="flex items-center mb-4">
            <button
              className="text-xs text-gray-400 hover:text-gray-300 flex items-center px-2 py-1 rounded hover:bg-gray-800/50 transition-colors"
              onClick={() => {
                setExpandedSection(null);
                setSelectedNoteId(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to tools
            </button>
          </div>
        )}

        {/* Show full note view when a note is selected */}
        {selectedNote ? (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <button
                className="text-xs text-gray-400 hover:text-gray-300 flex items-center px-2 py-1 rounded hover:bg-gray-800/50 transition-colors"
                onClick={() => setSelectedNoteId(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to{" "}
                {selectedNote?.type === "SUMMARY"
                  ? "summaries"
                  : selectedNote?.type === "STUDY_NOTES"
                  ? "study notes"
                  : "notes"}
              </button>
            </div>

            {selectedNote.type === "SUMMARY" && (
              <SummaryView
                summary={selectedNote}
                onRegenerate={() =>
                  handleRegenerateContent(
                    selectedNote.id,
                    "SUMMARY",
                    selectedNote.documentId
                  )
                }
                isRegenerating={generatingSummary[selectedNote.documentId]}
              />
            )}

            {selectedNote.type === "STUDY_NOTES" && (
              <StudyNotesView
                studyNotes={selectedNote}
                onRegenerate={() =>
                  handleRegenerateContent(
                    selectedNote.id,
                    "STUDY_NOTES",
                    selectedNote.documentId
                  )
                }
                isRegenerating={generatingStudyNotes[selectedNote.documentId]}
              />
            )}

            {selectedNote.type === "USER_NOTE" && (
              <div className="bg-gray-800/50 rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedNote.title}
                </h3>
                <div className="text-sm text-gray-400 mb-4">
                  Created on {selectedNote.createdAt}
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-a:text-blue-400 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200 mt-4">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Summary Section */}
            {expandedSection === "summary" && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase text-gray-400 mb-2 font-semibold tracking-wider">
                  Document Summaries
                </h3>

                {isLoadingNotes ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No documents available. Upload documents to generate
                    summaries.
                  </div>
                ) : (
                  renderDocumentList("summary")
                )}
              </div>
            )}

            {/* Study Notes Section */}
            {expandedSection === "notes" && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase text-gray-400 mb-2 font-semibold tracking-wider">
                  Study Notes
                </h3>

                {isLoadingNotes ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No documents available. Upload documents to generate study
                    notes.
                  </div>
                ) : (
                  renderDocumentList("notes")
                )}
              </div>
            )}

            {/* User Notes Section */}
            {expandedSection === "addNotes" && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase text-gray-400 mb-2 font-semibold tracking-wider">
                  Add Notes
                </h3>

                {documents.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No documents available. Upload documents to add notes.
                  </div>
                ) : (
                  <>
                    {!activeDocumentId ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300 mb-2">
                          Select a document to add notes:
                        </p>
                        {documents.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocumentId(doc.id)}
                            className="w-full text-left px-3 py-2 rounded-md bg-gray-800/70 hover:bg-gray-750 text-gray-300 border border-gray-700/50 hover:border-gray-600 transition-colors"
                          >
                            {doc.originalName || doc.filename}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center mb-2">
                          <button
                            className="text-xs text-gray-400 hover:text-gray-300 flex items-center px-2 py-1 rounded hover:bg-gray-800/50 transition-colors"
                            onClick={() => setActiveDocumentId(null)}
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to documents
                          </button>
                        </div>

                        <UserNotesView
                          notes={userNotes.filter(
                            (n) => n.documentId === activeDocumentId
                          )}
                          documentId={activeDocumentId}
                          onNoteSaved={handleNoteSaved}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Audio Generation Section (Disabled) */}
            {expandedSection === "audio" && (
              <div className="text-center py-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                  />
                </svg>
                <p className="text-gray-400 mb-2">
                  Audio generation is coming soon!
                </p>
                <p className="text-xs text-gray-500">
                  This feature will allow you to convert documents to audio.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionsSidebar;

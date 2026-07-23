import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/study/Navbar";
import { ChatView } from "../components/study/ChatView";
import { GenerateForm } from "../components/study/GenerateForm";
import { GeneratedContent } from "../components/study/GeneratedContent";
import { NotesList } from "../components/study/NotesList";
import { SettingsModal } from "../components/study/SettingsModal";
import { getNotes, saveNote, deleteNote, saveChatSession } from "../services/notesService";
import { generateStudyNotesWithAI, setApiKey, getApiKey, hasApiKey } from "../services/geminiService";
import { Note, StudyContent, ChatMessage } from "../types";
import { BookOpen, GraduationCap, ChevronDown, ChevronUp, Library, MessageSquare, GraduationCap as Hat } from "lucide-react";

export function Dashboard() {
  const [activeView, setActiveView] = useState<"chat" | "notes">("chat");
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentContent, setCurrentContent] = useState<StudyContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [showMobileLibrary, setShowMobileLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const refreshNotes = useCallback(() => {
    setNotes(getNotes());
  }, []);

  const handleGenerate = useCallback(async (title: string, topic: string) => {
    setIsGenerating(true);
    setCurrentContent(null);
    setIsSaved(false);
    setActiveNoteId(null);
    setCurrentTitle(title);
    setCurrentTopic(topic);

    try {
      const content = await generateStudyNotesWithAI(title, topic);
      setCurrentContent(content);
    } catch (error: any) {
      console.error("Generation error:", error);
      const isQuota = error.message?.includes("429") || error.message?.includes("quota");
      setCurrentContent({
        title,
        bulletPoints: isQuota
          ? ["AI quota exceeded. Please wait a few minutes or upgrade your Google Cloud plan."]
          : [`Study notes about ${topic}`, "Enable AI by setting your API key in Settings"],
        summary: isQuota
          ? "The free tier limit has been reached. Please wait a few minutes or upgrade your Google Cloud plan."
          : `Comprehensive study notes about ${topic}. Set your Gemini API key to get AI-generated content.`,
      });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!currentContent) return;

    const newNote: Note = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: currentTitle,
      topic: currentTopic,
      content: currentContent,
      createdAt: new Date().toISOString(),
    };

    saveNote(newNote);
    setIsSaved(true);
    setActiveNoteId(newNote.id);
    refreshNotes();
  }, [currentContent, currentTitle, currentTopic, refreshNotes]);

  const handleSelectNote = useCallback((note: Note) => {
    setCurrentContent(note.content);
    setCurrentTitle(note.title);
    setCurrentTopic(note.topic);
    setIsSaved(true);
    setIsGenerating(false);
    setActiveNoteId(note.id);
    setShowMobileLibrary(false);
    setActiveView("notes");
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    deleteNote(id);
    refreshNotes();
    if (activeNoteId === id) {
      setCurrentContent(null);
      setActiveNoteId(null);
      setIsSaved(false);
    }
  }, [activeNoteId, refreshNotes]);

  const handleSaveChatSession = useCallback((messages: ChatMessage[]) => {
    if (messages.length === 0) return;
    const session = {
      id: Date.now().toString(),
      title: messages[0]?.content?.substring(0, 40) || "Chat Session",
      messages,
      createdAt: new Date().toISOString(),
    };
    saveChatSession(session);
  }, []);

  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key);
    setShowSettings(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onLibraryClick={() => setShowMobileLibrary(!showMobileLibrary)}
        onChatClick={() => setActiveView("chat")}
        onSettingsClick={() => setShowSettings(true)}
        activeView={activeView}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentKey={getApiKey()}
        onSaveKey={handleSaveApiKey}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Hero Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Study Buddy
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your AI-powered study assistant — chat, learn, and create notes
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveView("chat")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === "chat"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveView("notes")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === "notes"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
            }`}
          >
            <Hat className="h-4 w-4" />
            Study Notes
          </button>
        </div>

        {/* Mobile Library Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileLibrary(!showMobileLibrary)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-foreground">
                {activeView === "chat" ? "Chat History" : "My Study Notes"}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{notes.length}</span>
            </div>
            {showMobileLibrary ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showMobileLibrary && (
            <div className="mt-2 p-3 rounded-xl border border-border/50 bg-card/80 backdrop-blur animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-foreground">My Study Notes</h2>
              </div>
              <NotesList
                notes={notes}
                activeNoteId={activeNoteId}
                onSelectNote={handleSelectNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeView === "chat" ? (
          /* Chat View - Full Width */
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 shadow-soft max-w-3xl mx-auto">
            <ChatView onSaveSession={handleSaveChatSession} />
          </div>
        ) : (
          /* Notes View - Two Column */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="md:col-span-5 space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Generate New Notes
                  </h2>
                </div>
                <GenerateForm onGenerate={handleGenerate} isLoading={isGenerating} />
              </div>

              {/* Desktop Library */}
              <div className="hidden md:block rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-foreground">My Study Notes</h2>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {notes.length}
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-1">
                  <NotesList
                    notes={notes}
                    activeNoteId={activeNoteId}
                    onSelectNote={handleSelectNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-7">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 shadow-soft min-h-[500px]">
                <div className="flex items-center gap-2 mb-5">
                  <div className={`h-2 w-2 rounded-full ${
                    isGenerating ? "bg-amber-400 animate-pulse" : currentContent ? "bg-emerald-400" : "bg-muted-foreground"
                  }`} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {isGenerating ? "Generating..." : currentContent ? "Generated Content" : "AI Output"}
                  </h2>
                </div>
                <GeneratedContent
                  content={currentContent}
                  isGenerating={isGenerating}
                  onSave={handleSave}
                  saved={isSaved}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
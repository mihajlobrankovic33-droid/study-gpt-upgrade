import { Note } from "../../types";
import { Trash2, FileText, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NotesListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesList({ notes, activeNoteId, onSelectNote, onDeleteNote }: NotesListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      onDeleteNote(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-purple-500/10 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No study notes yet</p>
        <p className="text-xs text-muted-foreground">
          Generate your first note above and save it to your library
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note)}
          className={`w-full text-left group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 border ${
            activeNoteId === note.id
              ? "bg-teal-500/10 border-teal-500/30"
              : "bg-card/30 border-transparent hover:bg-card/60 hover:border-border/50"
          }`}
        >
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
            activeNoteId === note.id
              ? "bg-teal-500 text-white"
              : "bg-muted text-muted-foreground group-hover:bg-teal-500/10 group-hover:text-teal-400"
          }`}>
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {note.title}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {new Date(note.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleDelete(note.id, e)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                confirmDelete === note.id
                  ? "bg-red-500/20 text-red-400"
                  : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              }`}
              title={confirmDelete === note.id ? "Click again to confirm" : "Delete note"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
              activeNoteId === note.id
                ? "text-teal-400"
                : "text-muted-foreground opacity-0 group-hover:opacity-100"
            }`} />
          </div>
        </button>
      ))}
    </div>
  );
}
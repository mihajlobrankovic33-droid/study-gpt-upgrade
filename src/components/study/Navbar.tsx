import { BookOpen, Settings, MessageSquare } from "lucide-react";

interface NavbarProps {
  onLibraryClick: () => void;
  onChatClick: () => void;
  onSettingsClick: () => void;
  activeView: "chat" | "notes";
}

export function Navbar({ onLibraryClick, onChatClick, onSettingsClick, activeView }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Study Buddy
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gemini Ready
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onChatClick}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeView === "chat"
                ? "bg-emerald-500/10 text-emerald-400"
                : "hover:bg-accent/10 hover:text-accent-foreground text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={onLibraryClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/10 hover:text-accent-foreground text-muted-foreground"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
          </button>
          <button
            onClick={onSettingsClick}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/10 hover:text-accent-foreground text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
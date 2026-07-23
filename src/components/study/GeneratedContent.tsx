import { StudyContent } from "../../types";
import { Save, FileText, BookOpenCheck, Lightbulb, Loader2 } from "lucide-react";

interface GeneratedContentProps {
  content: StudyContent | null;
  isGenerating: boolean;
  onSave: () => void;
  saved: boolean;
}

export function GeneratedContent({ content, isGenerating, onSave, saved }: GeneratedContentProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative h-16 w-16 rounded-full border-4 border-muted border-t-emerald-400 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground animate-pulse">
            Generating your study notes...
          </p>
          <p className="text-sm text-muted-foreground">
            Gemini AI is analyzing your topic and creating structured content
          </p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Generate Study Notes</h3>
        <p className="text-muted-foreground max-w-md">
          Fill in the form on the left with a title and topic, then click 
          <span className="font-semibold text-emerald-400"> Generate</span> to create AI-powered study notes.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-8">
          {["Structured Content", "Key Points", "Summary"].map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/50">
              {i === 0 && <BookOpenCheck className="h-5 w-5 text-emerald-400" />}
              {i === 1 && <Lightbulb className="h-5 w-5 text-amber-400" />}
              {i === 2 && <FileText className="h-5 w-5 text-teal-400" />}
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Points</h3>
        </div>
        <ul className="space-y-2.5">
          {content.bulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-teal-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Summary</h3>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/10 p-4">
          <p className="text-sm leading-relaxed text-foreground/85">{content.summary}</p>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saved}
        className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <Save className="h-4 w-4" />
        {saved ? "Saved to Library ✓" : "Save to Library"}
      </button>
    </div>
  );
}
import { useState } from "react";
import { Sparkles, Loader2, FileText } from "lucide-react";

interface GenerateFormProps {
  onGenerate: (title: string, topic: string) => void;
  isLoading: boolean;
}

export function GenerateForm({ onGenerate, isLoading }: GenerateFormProps) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || isLoading) return;
    onGenerate(title.trim(), topic.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Note Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Machine Learning Basics"
          className="flex h-12 w-full rounded-xl border border-input bg-card/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium text-foreground">
          Topic / Subject
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe what you want to study..."
          rows={4}
          className="flex min-h-[100px] w-full rounded-xl border border-input bg-card/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={!title.trim() || !topic.trim() || isLoading}
        className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Generate Study Notes
          </>
        )}
      </button>
    </form>
  );
}
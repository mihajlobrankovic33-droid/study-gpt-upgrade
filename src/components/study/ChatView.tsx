import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../../types";
import { chatWithGemini, hasApiKey } from "../../services/geminiService";
import { Send, Loader2, Trash2, Sparkles } from "lucide-react";

interface ChatViewProps {
  onSaveSession: (messages: ChatMessage[]) => void;
}

export function ChatView({ onSaveSession }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as "user" | "model",
        parts: [{ text: m.content }],
      }));

      const response = await chatWithGemini(
        `You are Study Buddy, a helpful AI study assistant. Help the student with their studies. Be concise, educational, and encouraging. Use bullet points and formatting when helpful.

Student message: ${userMsg.content}`,
        history
      );

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg, assistantMsg];
      setMessages((prev) => [...prev, assistantMsg]);
      onSaveSession(updatedMessages);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message?.includes("API key")
          ? "⚠️ Please set your Google Gemini API key first. Click the Settings/API Key button in the navbar."
          : `⚠️ Error: ${error.message || "Something went wrong. Please try again."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-foreground">AI Chat</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Start a Study Session</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask me anything about your studies! I can explain concepts, help with homework, create summaries, and more.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                "Explain quantum physics",
                "Help with calculus",
                "Summarize WW2",
                "Create flashcards",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="text-xs bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-500/20 text-foreground border border-emerald-500/20"
                    : "bg-card/80 border border-border/50 text-foreground/90"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card/80 border border-border/50 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 border-t border-border/30 pt-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasApiKey() ? "Ask a study question..." : "Set your API key in Settings first..."}
          rows={1}
          className="flex-1 min-h-[44px] max-h-[120px] rounded-xl border border-input bg-card/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all resize-none"
          disabled={isLoading || !hasApiKey()}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || !hasApiKey()}
          className="h-[44px] w-[44px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
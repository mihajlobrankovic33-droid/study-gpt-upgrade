import { useState, useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "../../types";
import {
  chatWithWebLLM,
  loadModel,
  isModelReady,
  isModelLoading,
  isWebLLMSupported,
} from "../../services/webllmService";
import { chatWithOllama, isOllamaRunning } from "../../services/ollamaService";
import { Send, Loader2, Trash2, Sparkles, Download, Cpu, WifiOff } from "lucide-react";

interface ChatViewProps {
  onSaveSession: (messages: ChatMessage[]) => void;
}

export function ChatView({ onSaveSession }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelState, setModelState] = useState<"unloaded" | "loading" | "ready" | "unsupported">("unloaded");
  const [loadProgress, setLoadProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const modelStateRef = useRef<"unloaded" | "loading" | "ready" | "unsupported">("unloaded");

  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    modelStateRef.current = modelState;
  }, [modelState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check WebGPU support on mount
  useEffect(() => {
    const initModel = async () => {
      if (!isWebLLMSupported()) {
        setModelState("unsupported");
        modelStateRef.current = "unsupported";
        return;
      }

      const ready = await isModelReady();
      if (ready) {
        setModelState("ready");
        modelStateRef.current = "ready";
        return;
      }

      if (isModelLoading()) {
        setModelState("loading");
        modelStateRef.current = "loading";
        return;
      }

      setModelState("unloaded");
      modelStateRef.current = "unloaded";
    };
    initModel();
  }, []);

  const handleLoadModel = async () => {
    setModelState("loading");
    modelStateRef.current = "loading";
    try {
      await loadModel((progress) => {
        setLoadProgress(progress);
      });
      setModelState("ready");
      modelStateRef.current = "ready";
    } catch (error: any) {
      console.error("Model load failed:", error);
      setModelState("unsupported");
      modelStateRef.current = "unsupported";
    }
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    // Use functional update to avoid stale closure
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let responseText: string | null = null;

    // Try WebLLM first (runs on device, no server needed)
    if (modelStateRef.current === "ready") {
      try {
        const chatHistory = messagesRef.current.map((m: ChatMessage) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        responseText = await chatWithWebLLM(userMsg.content, chatHistory);
      } catch (webllmError: any) {
        console.warn("WebLLM failed, trying Ollama:", webllmError.message);
      }
    }

    // Fall back to Ollama if WebLLM not available
    if (!responseText) {
      try {
        const ollamaRunning = await isOllamaRunning();
        if (ollamaRunning) {
          const chatHistory = messagesRef.current.map((m: ChatMessage) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
          responseText = await chatWithOllama(userMsg.content, chatHistory);
        }
      } catch (ollamaError: any) {
        console.warn("Ollama failed:", ollamaError.message);
      }
    }

    if (responseText) {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      // Use functional update to get the latest messages
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        // Save session with the latest messages
        onSaveSession(updated);
        return updated;
      });
    } else {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ AI model not available. Tap \"Load AI Model\" above to download the on-device AI, or use the Study Notes tab for built-in study content.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsLoading(false);
  }, [input, isLoading, onSaveSession]);

  const clearChat = () => {
    setMessages([]);
    messagesRef.current = [];
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
          {modelState === "ready" && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Cpu className="h-2.5 w-2.5" />
              On-Device AI
            </span>
          )}
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

      {/* Model Loading Banner */}
      {modelState === "unloaded" && isWebLLMSupported() && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Load AI Model on Your Device</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download a lightweight AI model (~1GB) that runs on your phone/tablet. Works offline after download.
              </p>
            </div>
            <button
              onClick={handleLoadModel}
              className="shrink-0 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
            >
              Load Model
            </button>
          </div>
        </div>
      )}

      {modelState === "loading" && (
        <div className="mb-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Downloading AI Model... {loadProgress}%</p>
              <p className="text-xs text-muted-foreground">This happens once. After download, AI works offline.</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {modelState === "unsupported" && (
        <div className="mb-4 p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">On-Device AI Not Available</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your browser doesn't support WebGPU. You can still use Study Notes with built-in content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Start a Study Session</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask me anything about your studies! I can explain STEM concepts, help with homework, create summaries, and more.
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
          messages.map((msg: ChatMessage) => (
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
          placeholder="Ask a study question..."
          rows={1}
          className="flex-1 min-h-[44px] max-h-[120px] rounded-xl border border-input bg-card/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all resize-none"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
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
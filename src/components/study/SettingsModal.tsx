import { useState } from "react";
import { X, Key, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export function SettingsModal({ isOpen, onClose, currentKey, onSaveKey }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-border/50 bg-card shadow-strong animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground">Google Gemini API Key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Go to <span className="text-emerald-400 font-medium">aistudio.google.com/apikey</span></p>
            <p>2. Click "Create API Key"</p>
            <p>3. Copy and paste it here</p>
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Get a free API key →
          </a>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || saved}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save API Key"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
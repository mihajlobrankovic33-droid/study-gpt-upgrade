export interface Note {
  id: string;
  title: string;
  topic: string;
  content: StudyContent;
  createdAt: string;
}

export interface StudyContent {
  title: string;
  bulletPoints: string[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}
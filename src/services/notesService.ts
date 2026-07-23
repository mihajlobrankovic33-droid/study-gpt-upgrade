import { Note, ChatSession } from "../types";

const NOTES_KEY = "study-buddy-notes";
const CHATS_KEY = "study-buddy-chats";

export function getNotes(): Note[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.push(note);
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function getChatSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(CHATS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveChatSession(session: ChatSession): void {
  const sessions = getChatSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  // Keep max 20 sessions
  const trimmed = sessions.slice(0, 20);
  localStorage.setItem(CHATS_KEY, JSON.stringify(trimmed));
}

export function deleteChatSession(id: string): void {
  const sessions = getChatSessions().filter((s) => s.id !== id);
  localStorage.setItem(CHATS_KEY, JSON.stringify(sessions));
}
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

function getKey(): string {
  return localStorage.getItem("gemini-api-key") || import.meta.env.VITE_GEMINI_API_KEY || "";
}

function initModel() {
  const key = getKey();
  if (!key) throw new Error("No API key set");
  genAI = new GoogleGenerativeAI(key);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export function setApiKey(key: string) {
  localStorage.setItem("gemini-api-key", key);
  genAI = new GoogleGenerativeAI(key);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

export function getApiKey(): string {
  return getKey();
}

export function hasApiKey(): boolean {
  return !!getKey();
}

export async function chatWithGemini(
  message: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  if (!model) initModel();

  const chat = model.startChat({
    history: history.slice(-20),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function generateStudyNotesWithAI(title: string, topic: string): Promise<{
  title: string;
  bulletPoints: string[];
  summary: string;
}> {
  if (!model) initModel();

  const prompt = `Create comprehensive study notes about "${topic}". 
Title: ${title || topic}

Return your response in this exact JSON format (no markdown, no backticks):
{
  "title": "The title of the notes",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"],
  "summary": "A concise summary paragraph"
}

Make the bullet points educational and informative. Include 5-7 key bullet points.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  try {
    return JSON.parse(cleaned);
  } catch {
    const titleMatch = text.match(/"title":\s*"([^"]+)"/);
    const bulletMatch = text.match(/"bulletPoints":\s*(\[[\s\S]*?\])/);
    const summaryMatch = text.match(/"summary":\s*"([^"]+)"/);
    
    return {
      title: titleMatch ? titleMatch[1] : title,
      bulletPoints: bulletMatch ? JSON.parse(bulletMatch[1]) : [`Study notes about ${topic}`],
      summary: summaryMatch ? summaryMatch[1] : `Comprehensive notes about ${topic}.`,
    };
  }
}
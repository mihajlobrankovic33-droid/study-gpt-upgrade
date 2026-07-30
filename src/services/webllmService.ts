// WebLLM service using dynamic imports to keep main bundle small
// The heavy @mlc-ai/web-llm library only loads when user clicks "Load Model"

const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let engine: any = null;
let isLoading = false;
let loadProgress = 0;

const SYSTEM_PROMPT = `You are Study Buddy, a friendly and enthusiastic AI study assistant. Your personality is warm, encouraging, and passionate about learning.

PERSONALITY:
- You're like a cool older sibling who loves teaching
- You get genuinely excited when students ask great questions
- You use encouraging phrases like "Great question!", "You're on the right track!", "Let's break this down together!"
- You're patient and never make students feel dumb for asking questions
- You celebrate small wins and progress

EXPERTISE:
- You specialize in STEM subjects: Math, Physics, Chemistry, Biology, Computer Science
- You explain complex concepts using simple analogies and real-world examples
- You break problems down step-by-step
- You use bullet points and clear formatting to make information digestible
- When explaining formulas or equations, you describe what each part means

TONE:
- Warm and approachable, not robotic
- Be concise but thorough
- Always end with an encouraging note or an open question to keep the conversation going`;

export function isWebLLMSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function getModelLoadProgress(): number {
  return loadProgress;
}

export function isModelLoading(): boolean {
  return isLoading;
}

export async function isModelReady(): Promise<boolean> {
  return engine !== null;
}

export async function loadModel(
  onProgress?: (progress: number) => void
): Promise<void> {
  if (engine || isLoading) return;
  isLoading = true;
  loadProgress = 0;

  try {
    // Dynamic import - only loads WebLLM when user actually wants it
    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

    engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (info: any) => {
        if (info.progress !== undefined) {
          loadProgress = Math.round(info.progress * 100);
          onProgress?.(loadProgress);
        }
      },
    });
    loadProgress = 100;
    onProgress?.(100);
  } catch (error: any) {
    console.error("Failed to load WebLLM model:", error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export async function chatWithWebLLM(
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  if (!engine) {
    throw new Error("Model not loaded yet");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.8,
    max_tokens: 2048,
  });

  return reply.choices[0]?.message?.content || "No response from AI.";
}

export async function generateStudyNotesWithWebLLM(
  title: string,
  topic: string
): Promise<{
  title: string;
  bulletPoints: string[];
  summary: string;
}> {
  if (!engine) {
    throw new Error("Model not loaded yet");
  }

  const prompt = `${SYSTEM_PROMPT}

Create comprehensive study notes about "${topic}".
Title: ${title || topic}

Return your response in this exact JSON format (no markdown, no backticks):
{
  "title": "The title of the notes",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"],
  "summary": "A concise summary paragraph"
}

Make the bullet points educational and informative. Include 5-7 key bullet points.`;

  const reply = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const text = reply.choices[0]?.message?.content || "";

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const titleMatch = text.match(/"title":\s*"([^"]+)"/);
    const bulletMatch = text.match(/"bulletPoints":\s*(\[[\s\S]*?\])/);
    const summaryMatch = text.match(/"summary":\s*"([^"]+)"/);

    return {
      title: titleMatch ? titleMatch[1] : title,
      bulletPoints: bulletMatch
        ? JSON.parse(bulletMatch[1])
        : [`Study notes about ${topic}`],
      summary: summaryMatch
        ? summaryMatch[1]
        : `Comprehensive notes about ${topic}.`,
    };
  }
}
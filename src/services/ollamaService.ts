const OLLAMA_URL = "http://localhost:11434/api/generate";
// Using qwen2.5:1.5b - lightweight (986MB), great for STEM
const DEFAULT_MODEL = "qwen2.5:1.5b";

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
- Use emojis sparingly but effectively 🎯
- Be concise but thorough
- Always end with an encouraging note or an open question to keep the conversation going`;

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function chatWithOllama(
  message: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const contextMessages = history
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Student" : "Study Buddy"}: ${m.content}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}\n\nPrevious conversation:\n${contextMessages}\n\nStudent: ${message}\n\nStudy Buddy:`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.8,
        max_tokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.response || "No response from Ollama.";
}

export async function generateStudyNotesWithOllama(
  title: string,
  topic: string
): Promise<{
  title: string;
  bulletPoints: string[];
  summary: string;
}> {
  const prompt = `${SYSTEM_PROMPT}

Create comprehensive study notes about "${topic}".
Title: ${title || topic}

Return your response in this exact JSON format (no markdown, no backticks):
{
  "title": "The title of the notes",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"],
  "summary": "A concise summary paragraph"
}

Make the bullet points educational and informative. Include 5-7 key bullet points. Focus on clear explanations that make complex topics easy to understand.`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.response || "";

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
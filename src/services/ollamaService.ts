const OLLAMA_URL = "http://localhost:11434/api/generate";
const DEFAULT_MODEL = "qwen2.5:1.5b";

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(2000),
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
  const systemPrompt = `You are Study Buddy, a helpful AI study assistant. Help the student with their studies. Be concise, educational, and encouraging. Use bullet points and formatting when helpful.`;

  const contextMessages = history
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `${systemPrompt}\n\nPrevious conversation:\n${contextMessages}\n\nStudent: ${message}\n\nAssistant:`;

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
  const prompt = `Create comprehensive study notes about "${topic}".
Title: ${title || topic}

Return your response in this exact JSON format (no markdown, no backticks):
{
  "title": "The title of the notes",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"],
  "summary": "A concise summary paragraph"
}

Make the bullet points educational and informative. Include 5-7 key bullet points.`;

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
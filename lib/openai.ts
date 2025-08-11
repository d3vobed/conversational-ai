export async function fetchOpenAIChat(prompt: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a compassionate assistant for dementia support. Answer with empathy and simplicity.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await res.json();

  if (res.ok && data.choices?.length > 0) {
    return data.choices[0].message.content || "I'm here for you.";
  }

  console.error("OpenAI error:", data);
  return "I'm here to support you, but I couldn’t generate a reply.";
}
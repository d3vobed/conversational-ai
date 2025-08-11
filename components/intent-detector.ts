// components/intent-detector.ts

export interface DetectionResult {
  intent: string;
  emotion: string;
  confidence: number; // 0.0 to 1.0 (mocked for now)
  isEmpathyTrigger: boolean;
}

/**
 * A simple rule-based emotion + intent classifier
 * Can be replaced later with model inference.
 */
export function detectIntentAndEmotion(input: string): DetectionResult {
  const text = input.toLowerCase();

  const emotionKeywords: Record<string, string[]> = {
    sad: ["sad", "down", "blue", "depressed", "crying"],
    anxious: ["anxious", "nervous", "worried", "panic", "fear"],
    lonely: ["lonely", "alone", "isolated", "abandoned"],
    confused: ["confused", "don’t understand", "lost", "unclear", "disoriented"],
    scared: ["scared", "afraid", "terrified", "fearful"],
    happy: ["happy", "joy", "glad", "excited", "content"],
  };

  const intentKeywords: Record<string, string[]> = {
    seek_reassurance: ["am i ok", "what’s wrong with me", "do you care", "i feel bad"],
    express_feelings: ["i feel", "i’m", "i’m feeling", "it feels like"],
    ask_question: ["what", "why", "how", "where", "when"],
    memory_check: ["do you remember", "what happened", "what’s this"],
  };

  let detectedEmotion = "neutral";
  let detectedIntent = "chit_chat";

  for (const [emotion, words] of Object.entries(emotionKeywords)) {
    if (words.some((w) => text.includes(w))) {
      detectedEmotion = emotion;
      break;
    }
  }

  for (const [intent, words] of Object.entries(intentKeywords)) {
    if (words.some((w) => text.includes(w))) {
      detectedIntent = intent;
      break;
    }
  }

  const isEmpathyTrigger =
    ["sad", "lonely", "anxious", "confused", "scared"].includes(detectedEmotion) ||
    detectedIntent === "seek_reassurance";

  return {
    intent: detectedIntent,
    emotion: detectedEmotion,
    confidence: 0.8, // mock confidence for now
    isEmpathyTrigger,
  };
}

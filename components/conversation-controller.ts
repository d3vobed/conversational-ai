import { supabase } from "@/lib/supabase";
import axios from "axios";
import { detectIntentAndEmotion } from "./intent-detector";
import { translateText } from "./translate";

type SupportedModel = "primary" | "secondary" | "openai";
const PRIMARY_HF_API = "https://obx0x3-conversation-response.hf.space/generate";
const SECONDARY_HF_API = "https://obx0x3-empathy-api.hf.space/generate";

async function handleCommand(input: string, lang: "en" | "fr", _sessionId: string) {
  const lower = input.toLowerCase();
  if (lower.match(/^\w+$/)) {
  return {
    reply: `ℹ️ You said: “${input}”`,
    source: "text"
  };
}
  if (lower.includes("call") && (lower.includes("emergency") || lower.match(/\d{3,}/))) {
    const number = lower.match(/\d{3,}/)?.[0] || "112";
    await supabase.from("emergency_contacts").insert({ number, called_at: new Date().toISOString() });
    return { reply: `📞 Emergency number ${number} logged.`, source: "command::navigate:/settings/tabs/emergency-call" };
  }
  if (lower.includes("what games") || lower.includes("available games")) {
    return { reply: "🧠 Available games: Memory Match, Word Recall", source: "command::navigate:/settings/tabs/cognitive-games" };
  }
  if (lower.startsWith("remind me") || lower.includes("set a reminder")) {
    const text = input.replace(/remind me (to|that)?/i, "").trim();
    await supabase.from("reminder_logs").insert({ text, created_at: new Date().toISOString() });
    return { reply: `📝 Reminder saved: “${text}”`, source: "command::navigate:/settings/reminders" };
  }
  const mem = input.match(/^(.+?) is my (.+)$/i);
  if (mem) {
    const [, name, desc] = mem;
    await supabase.from("memory_aids").insert({ name: name.trim(), description: desc.trim(), language: lang, created_at: new Date().toISOString() });
    return { reply: `💡 Memory aid saved: ${name.trim()} = ${desc.trim()}`, source: "command::navigate:/settings/memory-aid" };
  }
  return null;
}

function getModelPrompt(input: string, lang: "en" | "fr") {
  const l = input.toLowerCase();
  const isQ = /^(why|what|how|when|where|who|can|is|do)\b/.test(l);
  const isE = /(feel|i am|forgot|lost|scared|sad|lonely)/i.test(l);
  if (lang === "fr") return `émotion: ${input}`;
  if (isE) return `emotion: ${input}`;
  if (isQ) return `chat: ${input}`;
  return `chat: ${input}`;
}

async function callHF(api: string, prompt: string, lang: string): Promise<string> {
  const res = await axios.post(api, { message: prompt, lang });
  return res?.data?.reply?.trim() || "";
}

export async function handleReply(
  userInput: string,
  options: {
    careMode?: boolean;
    datasetContext?: string;
    useDatasetContext?: boolean;
    memory?: string;
    openaiSubmit: (msg: string) => Promise<any>;
    lang: "en" | "fr";
    personality?: string;
    sessionId: string;
    modelPreference?: SupportedModel;
  }
) {
  const {
    careMode = false,
    datasetContext = "",
    useDatasetContext = true,
    memory = "",
    openaiSubmit,
    lang,
    personality = "supportive and compassionate",
    sessionId,
    modelPreference = "primary"
  } = options;

  const txt = userInput.trim();
  if (!txt) return { reply: lang === "fr" ? "Je n'ai rien compris." : "I didn't catch that.", source: "openai", sourceIcon: "🤖" };

  const cmd = await handleCommand(txt, lang, sessionId);
  if (cmd) return { reply: cmd.reply, sourceIcon: "🧠" };

  const { intent, emotion, confidence, isEmpathyTrigger } = detectIntentAndEmotion(txt);
  const shouldCare = careMode || isEmpathyTrigger;
  const prompt = getModelPrompt(txt, lang);

  const order: SupportedModel[] = modelPreference === "openai"
    ? ["openai"]
    : modelPreference === "secondary"
      ? ["secondary", "openai"]
      : ["primary", "secondary", "openai"];

  let reply = "", source: SupportedModel = modelPreference;

  for (const m of order) {
    try {
      if (m === "primary") reply = await callHF(PRIMARY_HF_API, prompt, lang);
      else if (m === "secondary") reply = await callHF(SECONDARY_HF_API, prompt, lang);
      else {
        const cp = useDatasetContext
          ? `${personality}. Use context:\n${datasetContext}\nUser: ${txt}`
          : `${personality}. User: ${txt}`;
        const eng = lang === "fr" ? await translateText(cp, "fr", "en") : cp;
        const ai = await openaiSubmit(eng);
        const raw = typeof ai === "string" ? ai : ai.reply || "";
        reply = lang === "fr" ? await translateText(raw, "en", "fr") : raw;
      }
      if (reply) {
        source = m;
        break;
      }
    } catch (_) {
      // try next
    }
  }

  await supabase.from("chat_logs").insert({
    input: txt, output: reply, source, language: lang, memory: memory ? [memory] : [],
    care_mode: shouldCare, session_id: sessionId, intent, emotion, confidence,
    created_at: new Date().toISOString()
  });

  const icon = source === "openai" ? "🤖" : "🧠";
  return { reply, source, sourceIcon: icon };
}

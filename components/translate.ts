import axios from "axios";

export async function translateText(text: string, from: "en" | "fr", to: "en" | "fr") {
  if (from === to) return text;

  try {
    const res = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: from,
      target: to,
      format: "text",
    });

    return res.data.translatedText;
  } catch (err) {
    console.error("Translation error:", err);
    return text; 
  }
}

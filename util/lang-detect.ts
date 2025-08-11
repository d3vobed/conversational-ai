export function detectLanguage(text: string): "en" | "fr" {
  const frWords = ["je", "tu", "suis", "pas", "avec", "où", "quoi"];
  const lower = text.toLowerCase();
  const isFrench = frWords.some((w) => lower.includes(w));
  return isFrench ? "fr" : "en";
}

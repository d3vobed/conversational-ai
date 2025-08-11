export type ConversationToggleState = {
  autoSend: boolean;
  careMode: boolean;
  useDatasetContext: boolean;
  memory?: string;
  lang?: "en" | "fr" | "ha" | "ar";
  personality?: string;
};

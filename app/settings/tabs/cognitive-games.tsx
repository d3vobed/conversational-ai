import { MemoryMatchGame } from "@/components/games/memory-match";
import { WordRecallGame } from "@/components/games/word-recall";
import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { ScrollView, Text, View } from "react-native";

export async function logGameActivity({
  game_name,
  result,
}: {
  game_name: string;
  result: string;
}) {
  await supabase.from("game_memory").insert({
    game_name,
    result,
    played_at: new Date().toISOString(),
  });
}

export default function CognitiveGamesScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "600", color: theme.colors.text, marginBottom: 16 }}>
        🧠 Cognitive Games
      </Text>

      <Text style={{ fontSize: 16, color: theme.colors.text, opacity: 0.8, marginBottom: 24 }}>
        Test your memory and focus with these fun games.
      </Text>

      <View style={{ gap: 32 }}>
        <MemoryMatchGame />
        <WordRecallGame />
      </View>
    </ScrollView>
  );
}

// components/games/memory-match.tsx

import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";

const EASY = ["🧠", "🦋"];
const MEDIUM = ["🧠", "🦋", "🌟", "🍎"];
const HARD = ["🧠", "🦋", "🌟", "🍎", "🎵", "💡"];
const screenWidth = Dimensions.get("window").width;
const tileSize = screenWidth / 5 - 12;

function shuffleTriple(array: string[]) {
  return [...array, ...array, ...array].sort(() => Math.random() - 0.5);
}

export function MemoryMatchGame() {
  const { theme } = useTheme();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [tiles, setTiles] = useState<string[]>(shuffleTriple(EASY));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleFlip = (index: number) => {
    if (flipped.length === 3 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 3) {
      const [i1, i2, i3] = newFlipped;
      if (tiles[i1] === tiles[i2] && tiles[i2] === tiles[i3]) {
        const newMatched = [...matched, i1, i2, i3];
        setMatched(newMatched);
        if (newMatched.length === tiles.length) {
          supabase.from("cognitive_logs").insert({
            type: "memory-match",
            difficulty,
            completed_at: new Date().toISOString(),
            status: "success",
          });
        }
      }
      setTimeout(() => setFlipped([]), 1200);
    }
  };

  const changeDifficulty = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level);
    const base = level === "easy" ? EASY : level === "medium" ? MEDIUM : HARD;
    setTiles(shuffleTriple(base));
    setFlipped([]);
    setMatched([]);
  };

  return (
    <View>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: 8 }}>Select Difficulty</Text>
        <Picker
          selectedValue={difficulty}
          onValueChange={(value) => changeDifficulty(value)}
          style={{ color: theme.colors.text }}
        >
          <Picker.Item label="Easy" value="easy" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="Hard" value="hard" />
        </Picker>
      </View>

      <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center", gap: 10 }}>
        {tiles.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <Pressable
              key={index}
              onPress={() => handleFlip(index)}
              style={{
                width: tileSize,
                height: tileSize,
                backgroundColor: theme.colors.card,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 28 }}>{isFlipped ? emoji : "❓"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

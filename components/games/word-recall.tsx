
import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

const EASY_WORDS = ["cat", "hat", "dog"];
const MEDIUM_WORDS = ["banana", "sunshine", "guitar"];
const HARD_WORDS = ["discovery", "architecture", "resilience"];

export function WordRecallGame() {
  const { theme } = useTheme();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [word, setWord] = useState("");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"show" | "guess">("show");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let source = EASY_WORDS;
    if (difficulty === "medium") source = MEDIUM_WORDS;
    if (difficulty === "hard") source = HARD_WORDS;

    const newWord = source[Math.floor(Math.random() * source.length)];
    setWord(newWord);
    setPhase("show");
    setFeedback("");

    const timeout = setTimeout(() => {
      setPhase("guess");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [difficulty]);

  const checkAnswer = async () => {
    const isCorrect = input.trim().toLowerCase() === word.toLowerCase();
    setFeedback(isCorrect ? "✅ Correct!" : `❌ Oops! It was "${word}"`);

    await supabase.from("cognitive_logs").insert({
      type: "word-recall",
      difficulty,
      completed_at: new Date().toISOString(),
      status: isCorrect ? "success" : "fail",
    });
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>Word Recall Game</Text>

      <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Select Difficulty</Text>
      <Picker
        selectedValue={difficulty}
        onValueChange={(value) => setDifficulty(value)}
        style={{ color: theme.colors.text }}
      >
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      {phase === "show" ? (
        <Text style={{ fontSize: 28, textAlign: "center", color: theme.colors.primary }}>{word}</Text>
      ) : (
        <View>
          <TextInput
            placeholder="Enter the word you saw"
            value={input}
            onChangeText={setInput}
            style={{
              borderColor: theme.colors.border,
              borderWidth: 1,
              padding: 12,
              borderRadius: 8,
              color: theme.colors.text,
            }}
          />
          <Button title="Submit" onPress={checkAnswer} />
        </View>
      )}

      {feedback && <Text style={{ color: theme.colors.text }}>{feedback}</Text>}
    </View>
  );
}

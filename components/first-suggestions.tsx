"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { handleReply } from "@/components/conversation-controller";
import { useTheme } from "@/components/ui/ThemeProvider";
import { nanoid } from "@/util/nanoid";
import { tw } from "@/util/tw";
import { BotMessage } from "./bot-message";
import { BotTypingCard } from "./ui/BotTypingCard";
import { UserMessage } from "./user-message";

const suggestions = [
  "I feel lonely today",
  "Je ne sais pas où je suis.",
  "I forgot my daughter’s name",
  "Call emergency",
  "Je me sens perdu",
  "Launch memory game",
  "Appelle les urgences",
  "I need help remembering",
  "I feel anxious about tomorrow",
  "What games are available?",
  "Quels jeux sont disponibles"
];

export function FirstSuggestions({
  setMessages,
  sessionId,
}: {
  setMessages: (fn: (prev: any[]) => any[]) => void;
  sessionId: string;
}) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const styles = StyleSheet.create({
    scrollContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    suggestionRow: {
      flexDirection: "row",
      gap: 12,
    },
    suggestion: {
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      marginRight: 12,
    },
    suggestionText: {
      color: theme.colors.text,
      fontSize: 16,
      textAlign: "center",
    },
  });

  const scrollToNext = () => {
    if (!scrollRef.current) return;

    currentIndex.current =
      (currentIndex.current + 1) % suggestions.length;

    scrollRef.current.scrollTo({
      x: currentIndex.current * 200,
      animated: true,
    });
  };

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) scrollToNext();
    }, 4000);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [isPaused]);

  const handleTap = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nanoid(), display: <UserMessage>{text}</UserMessage> },
      { id: "typing", display: <BotTypingCard /> },
    ]);

    try {
      const { reply } = await handleReply(text, {
        careMode: true,
        useDatasetContext: false,
        lang: "en",
        sessionId,
        personality: "supportive and compassionate",
        openaiSubmit: function (msg: string): Promise<any> {
          throw new Error("Function not implemented.");
        }
      });

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "typing"),
        { id: nanoid(), display: <BotMessage>{reply}</BotMessage> },
      ]);
    } catch (err) {
      console.error("Hugging Face model error:", err);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== "typing"),
        {
          id: nanoid(),
          display: <BotMessage>Sorry, I couldn’t respond just now.</BotMessage>,
        },
      ]);
    }
  };

  return (
    <ScrollView
      horizontal
      ref={scrollRef}
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
      contentContainerStyle={styles.suggestionRow}
      onScrollBeginDrag={() => setIsPaused(true)}
      onScrollEndDrag={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      scrollEventThrottle={16}
    >
      {suggestions.map((title, index) => (
        <Animated.View entering={FadeInDown.delay(index * 100)} key={index}>
          <TouchableOpacity
            onPress={() => handleTap(title)}
            activeOpacity={0.7}
            onPressIn={() => setIsPaused(true)}
            onPressOut={() => setIsPaused(false)}
          >
            <View
              style={[
                styles.suggestion,
                tw`transition-colors hover:bg-systemGray4`,
              ]}
            >
              <Text style={styles.suggestionText}>{title}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

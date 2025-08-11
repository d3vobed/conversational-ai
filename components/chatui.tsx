"use client";

import { useActions, useAIState, useUIState } from "ai/rsc";
import { Stack } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nanoid } from "@/util/nanoid";
import { tw } from "@/util/tw";
import { Link } from "expo-router";
import { AI } from "./ai-context";
import { AnimatedLogo } from "./animated-logo";
import { BotMessage } from "./bot-message";
import { ChatContainer } from "./chat-container";
import { ChatToolbarInner } from "./chat-toolbar";
import { KeyboardFriendlyScrollView } from "./keyboard-friendly-scrollview";
import { HeaderButton } from "./ui/Header";
import { IconSymbol } from "./ui/IconSymbol";
import { useTheme } from "./ui/ThemeProvider";

const HEADER_HEIGHT = 0;

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join("");
  if (React.isValidElement(node)) return extractTextFromNode(node.props.children);
  return "";
}

function MessagesScrollView({ messages }: { messages: ReturnType<typeof useUIState<typeof AI>>[0] }) {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const textInputHeight = 8 + 36;

  useEffect(() => {
  const lastMessage = messages[messages.length - 1];
if (
  lastMessage &&
  React.isValidElement(lastMessage.display) &&
  lastMessage.display.props?.source?.startsWith?.("command::navigate:")
) {
  const route = lastMessage.display.props.source.split("command::navigate:")[1];
  if (route) {
  }
}


    if (
      lastMessage &&
      React.isValidElement(lastMessage.display) &&
      lastMessage.display.type === BotMessage
    ) {
      try {
        const textToSpeak = extractTextFromNode(lastMessage.display);
        if (textToSpeak.trim()) {
          Speech.stop();
          Speech.speak(textToSpeak, { language: "en-US" });
        }
      } catch (err) {
        console.error("expo-speech error:", err);
      }
    }
  }, [messages]);

  
  return (
    <>
      <KeyboardFriendlyScrollView
        style={[
          { flex: 1, backgroundColor: theme.colors.background },
          tw`md:w-[768px] max-w-[768px] md:mx-auto`,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: top + HEADER_HEIGHT + 24,
          paddingBottom: textInputHeight + 60,
          gap: 16,
          flex: messages.length ? undefined : 1,
        }}
      >
        <FeatureCards />
        {messages.map((message) => (
          <View key={message.id}>{message.display}</View>
        ))}
      </KeyboardFriendlyScrollView>
      {messages.length === 0 && <AnimatedLogo />}
    </>
  );
}

function ChatToolbar() {
  const [messages, setMessages] = useUIState<typeof AI>();
  const { onSubmit } = useActions<typeof AI>();

  return (
    <ChatToolbarInner messages={messages} setMessages={setMessages} onSubmit={onSubmit} />
  );
}

export function ChatUI() {
  const [, setAIState] = useAIState<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { theme } = useTheme();

  return (
    <ChatContainer>
      <Stack.Screen
        options={{
          headerRight: () => (
            <>
              {!!messages.length && (
                <HeaderButton
                  pressOpacity={0.7}
                  style={[
                    process.env.EXPO_OS === "web"
                      ? { paddingHorizontal: 16, alignItems: "center", display: "flex" }
                      : { marginRight: -8 },
                  ]}
                  onPress={() => {
                    Speech.stop();
                    setAIState({ chatId: nanoid(), messages: [] });
                    setMessages([]);
                  }}
                >
                  <IconSymbol name="square.and.pencil" color={theme.colors.text} />
                </HeaderButton>
              )}
            </>
          ),
        }}
      />

      <MessagesScrollView messages={messages} />
      <ChatToolbar />
    </ChatContainer>
  );
}

function FeatureCards() {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const features = [
    {
      title: "Reminders",
      icon: "bell.fill",
      route: "/settings/reminders",
    },
    {
      title: "Memory Aid",
      icon: "light-bulb", 
      route: "/settings/memory-aid",
    },
    {
      title: "Emergency Call",
      icon: "phone.fill",
      route: "/settings/tabs/emergency-contact-form",
    },
    {
      title: "Cognitive Games",
      icon: "gamecontroller.fill",
      route: "/settings/tabs/cognitive-games",
    },
  ];

  const scrollToNext = () => {
    if (!scrollRef.current) return;
    currentIndex.current = (currentIndex.current + 1) % features.length;
    scrollRef.current.scrollTo({ x: currentIndex.current * 140, animated: true });
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isPaused) scrollToNext();
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: theme.colors.text,
          marginBottom: 12,
        }}
      >
        Quick Access
      </Text>

      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        onScrollBeginDrag={() => setIsPaused(true)}
        onScrollEndDrag={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        scrollEventThrottle={16}
      >
        {features.map((feature) => (
          <Link key={feature.title} href={feature.route as any} asChild>
            <Pressable
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                width: 120,
                height: 100,
                alignItems: "center",
                justifyContent: "center",
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            >
              <IconSymbol name={feature.icon as any} size={28} color={theme.colors.primary} />
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                {feature.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

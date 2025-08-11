// chat-toolbar.tsx (Updated)
import { handleReply } from "@/components/conversation-controller";
import { supabase } from "@/lib/supabase";
import { nanoid } from "@/util/nanoid";
import { tw } from "@/util/tw";
import { useActions, useUIState } from "ai/rsc";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Modal, NativeSyntheticEvent, Pressable, Switch, Text,
  TextInput, TextInputSubmitEditingEventData, View,
} from "react-native";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import micAnimation from "../assets/icons/mic.json";
import typingAnimation from "../assets/icons/typing.json";
import type { AI } from "./ai-context";
import { BotMessage } from "./bot-message";
import { FirstSuggestions } from "./first-suggestions";
import { BotTypingCard } from "./ui/BotTypingCard";
import { IconSymbol } from "./ui/IconSymbol";
import { useTheme } from "./ui/ThemeProvider";
import TouchableBounce from "./ui/TouchableBounce";
import { UserMessage } from "./user-message";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY || "YOUR_KEY_HERE";

export function ChatToolbarInner({
  messages,
  setMessages,
  onSubmit,
  disabled = false,
}: {
  messages: ReturnType<typeof useUIState<typeof AI>>[0];
  setMessages: ReturnType<typeof useUIState<typeof AI>>[1];
  onSubmit: ReturnType<typeof useActions<typeof AI>>["onSubmit"];
  disabled?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [autoSend, setAutoSend] = useState(true);
  const [useHFModel, setUseHFModel] = useState(false);
  const [useContext, setUseContext] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [datasetContext, setDatasetContext] = useState<string | undefined>(undefined);
  const [memory, setMemory] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState(() => nanoid());
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const textInput = useRef<TextInput>(null);
  const keyboard = useAnimatedKeyboard();
  const { bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();

  const translateStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const blurStyle = useAnimatedStyle(() => {
    const assumedKeyboardHeight = 100;
    const inverse = Math.max(0, Math.min(1, (assumedKeyboardHeight - keyboard.height.value) / assumedKeyboardHeight));
    return { paddingBottom: 8 + bottom * inverse };
  }, [bottom]);

  useEffect(() => {
    const loadContext = async () => {
      const { data, error } = await supabase
        .from("datasets")
        .select("content")
        .eq("is_active", true)
        .single();

      if (!error && data?.content) setDatasetContext(data.content.slice(0, 1500));
    };
    loadContext();
  }, []);

  const detectLangFromText = (text: string): "en" | "fr"  => {
    // Naive detector. Replace with library or profile setting if needed.
    if (/[\u00C0-\u017F]/.test(text)) return "fr";
    return "en";
  };

  const storeMemory = async (message: string, reply: string) => {
    await supabase.from("chat_memory").insert({
      session_id: sessionId,
      user_input: message,
      ai_response: reply,
      created_at: new Date().toISOString(),
    });
  };

  const onSubmitMessage = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const detectedLang = detectLangFromText(trimmed);

      setInputValue("");
      textInput.current?.clear();

      setMessages((curr: any) => [
        ...curr,
        { id: nanoid(), display: <UserMessage>{trimmed}</UserMessage> },
        { id: "typing", display: <BotTypingCard /> },
      ]);

      try {
        setIsTyping(true);

        const { reply, source } = await handleReply(trimmed, {
          careMode: useHFModel,
          datasetContext,
          useDatasetContext: useContext,
          memory,
          openaiSubmit: onSubmit,
          lang: detectedLang,
          personality: "supportive and compassionate",
          sessionId,
        });

        setMemory(trimmed);
        await storeMemory(trimmed, reply);

        setMessages((curr: any) => [
          ...curr.filter((msg: any) => msg.id !== "typing"),
          { id: nanoid(), display: <BotMessage>{reply}</BotMessage> },
        ]);
      } catch (err) {
        console.error("AI reply error:", err);
        setMessages((curr: any) => [
          ...curr.filter((msg: any) => msg.id !== "typing"),
          { id: nanoid(), display: <BotMessage>Error: Unable to process your message.</BotMessage> },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [useHFModel, useContext, datasetContext, memory, onSubmit, sessionId, setMessages]
  );

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording as Audio.Recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    const net = await Network.getNetworkStateAsync();
    if (!net.isConnected) {
      Alert.alert("No internet connection");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri || "",
        name: "file.mp3",
        type: "audio/mp3",
      } as any);
      formData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_KEY}` },
        body: formData,
      });

      const data = await response.json();
      setRecordedText(data.text);

      await supabase.from("transcripts").insert({
        text: data.text,
        created_at: new Date().toISOString(),
      });

      autoSend ? onSubmitMessage(data.text) : setModalVisible(true);
    } catch (err) {
      console.error("Whisper transcription error", err);
      setRecordedText("Could not transcribe audio.");
      setModalVisible(true);
    }
  };

  const onSubmitEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      onSubmitMessage(e.nativeEvent.text);
    },
    [onSubmitMessage]
  );

  return (
    <Animated.View style={[{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "transparent" }, translateStyle]}>
      <View style={tw`md:w-[768px] max-w-[768px] md:mx-auto`}>
{messages.length === 0 && (
  <FirstSuggestions setMessages={setMessages} sessionId={sessionId} />
)}
      </View>

      <AnimatedBlurView
        tint={theme.dark ? "dark" : "light"}
        intensity={90}
        style={[{ paddingTop: 8, paddingHorizontal: 16 }, blurStyle]}
      >


<View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, tw`md:w-[768px] max-w-[768px] md:mx-auto`]}>
  <TouchableBounce onPress={() => router.push("/settings/profile")}>
    <View style={{ padding: 8, width: 32, height: 32 }}>
      <LottieView
        source={typingAnimation}
        autoPlay
        loop
        style={{ width: 32, height: 32 }}
      />
    </View>
  </TouchableBounce>

          <TextInput
            ref={textInput}
            onChangeText={setInputValue}
            placeholder={isRecording ? "Listening..." : "Type a message"}
            returnKeyType="send"
            onSubmitEditing={onSubmitEditing}
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.colors.text,
              backgroundColor: theme.colors.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: 12,
              paddingHorizontal: 16,
              opacity: isRecording ? 0.5 : 1,
            }}
          />

          {isRecording && <LottieView source={micAnimation} autoPlay loop style={{ width: 40, height: 40 }} />}
          <TouchableBounce onPress={isRecording ? stopRecording : startRecording}>
            <View style={{ padding: 8 }}>
              <IconSymbol name={isRecording ? "stop.circle.fill" : "mic.fill"} size={24} color={isRecording ? "red" : theme.colors.primary} />
            </View>
          </TouchableBounce>
            {inputValue.length > 0 && !isRecording && (
              <SendButton enabled onPress={() => onSubmitMessage(inputValue)} />
            )}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
          {/* Tool Selector Button */}
          <Pressable onPress={() => setModalVisible(true)} style={{ padding: 6 }}>
            <IconSymbol name="plus.circle" size={22} color={theme.colors.primary} />
          </Pressable>

          <Text style={{ color: theme.colors.text, fontSize: 14 }}>Session: {sessionId.slice(0, 6)}...</Text>
        </View>
      </AnimatedBlurView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 24 }}>
          <View style={{ backgroundColor: theme.colors.card, padding: 24, borderRadius: 16 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, marginBottom: 12 }}>Tools</Text>
            <View style={{ gap: 16 }}>
              <ToggleRow label="Auto-send" value={autoSend} onValueChange={setAutoSend} />
              <ToggleRow label="Use Context" value={useContext} onValueChange={setUseContext} />
              <ToggleRow label="Care Mode (HF)" value={useHFModel} onValueChange={setUseHFModel} />
              <ToggleRow label="Mute TTS" value={!ttsEnabled} onValueChange={(val) => setTtsEnabled(!val)} />
            </View>
            <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 24 }}>
              <Text style={{ color: theme.colors.primary, textAlign: "center", fontSize: 16 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

function SendButton({ enabled, onPress }: { enabled?: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableBounce disabled={!enabled} onPress={onPress}>
      <View style={{
        width: 40, height: 40, borderRadius: 999,
        backgroundColor: enabled ? theme.colors.primary : theme.colors.border,
        alignItems: "center", justifyContent: "center"
      }}>
        <IconSymbol name="arrow.up" size={20} color={enabled ? "white" : theme.colors.text} />
      </View>
    </TouchableBounce>
  );
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ color: theme.colors.text }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

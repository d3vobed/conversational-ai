// components/assistant-message.tsx

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ui/ThemeProvider';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "sk-..."; // Make sure your key is securely stored

export function AssistantMessage({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const speakText = async () => {
      if (!children || typeof children !== 'string') return;

      try {
        setIsSpeaking(true);
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: children,
            model: "tts-1",
            voice: "alloy",
          }),
        });

        if (!response.ok) throw new Error("TTS request failed");

        const buffer = await response.arrayBuffer();
        const fileUri = FileSystem.documentDirectory + `bot-reply-${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString("base64"), {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        await sound.playAsync();
      } catch (err) {
        console.error("Assistant TTS playback failed:", err);
      } finally {
        setIsSpeaking(false);
      }
    };

    speakText();
  }, [children]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.border }]}> 
        <Image source={require("../assets/icons/awe.png")} style={styles.icon} />
      </View>
      <View style={[styles.bubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
        <Text style={[styles.text, { color: theme.colors.text }]}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    width: 22,
    height: 22,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});

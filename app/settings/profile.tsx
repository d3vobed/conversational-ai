import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { tw } from "@/util/tw";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker"; // <- Add this
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Switch, Text, TextInput, View } from "react-native";

const PROFILE_KEY = "user_profile";

export default function ProfileSettings() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("default");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [autoSend, setAutoSend] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const local = await AsyncStorage.getItem(PROFILE_KEY);
      if (local) {
        const profile = JSON.parse(local);
        setName(profile.name || "");
        setLanguage(profile.language || "en-US");
        setVoice(profile.voice || "default");
        setTtsEnabled(profile.ttsEnabled ?? true);
setAutoSend(profile.autosend ?? true);
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const saveProfile = async () => {
    const profile = { name, language, voice, ttsEnabled, autoSend };
    setSaving(true);

    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

      const { error } = await supabase.from("profiles").upsert({
        id: "main",
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Saved", "Your preferences have been updated.");
    } catch (err) {
      Alert.alert("Error", "Could not save settings.");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[{ flex: 1, padding: 20, backgroundColor: theme.colors.background }, tw`md:w-[768px] max-w-[768px] md:mx-auto`]}>
      <Text style={{ fontSize: 24, color: theme.colors.text, marginBottom: 20 }}>Profile Settings</Text>

      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Your Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        placeholderTextColor={theme.colors.border}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
        }}
      />

      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Preferred Language</Text>
      <Picker
        selectedValue={language}
        onValueChange={(val) => setLanguage(val)}
        style={{ color: theme.colors.text, backgroundColor: theme.colors.card, marginBottom: 16 }}
      >
        <Picker.Item label="English (en-US)" value="en-US" />
        <Picker.Item label="French (fr-FR)" value="fr-FR" />
      </Picker>

      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Voice Type</Text>
      <Picker
        selectedValue={voice}
        onValueChange={(val) => setVoice(val)}
        style={{ color: theme.colors.text, backgroundColor: theme.colors.card, marginBottom: 16 }}
      >
        <Picker.Item label="Default" value="default" />
        <Picker.Item label="Alloy" value="alloy" />
        <Picker.Item label="Nova" value="nova" />
        {/* Add more voices if supported */}
      </Picker>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text }}>Enable TTS</Text>
        <Switch value={ttsEnabled} onValueChange={setTtsEnabled} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Text style={{ color: theme.colors.text }}>Auto-send After Voice</Text>
        <Switch value={autoSend} onValueChange={setAutoSend} />
      </View>

      <Pressable
        onPress={saveProfile}
        disabled={saving}
        style={{
          backgroundColor: saving ? theme.colors.border : theme.colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>{saving ? "Saving..." : "Save Settings"}</Text>
      </Pressable>
    </View>
  );
}

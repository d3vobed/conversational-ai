import * as Form from "@/components/ui/Form";
import { useTheme } from "@/components/ui/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export { ErrorBoundary } from "expo-router";

export default function SettingsRoute() {
  const { isDark, toggleTheme, theme } = useTheme();

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceType, setVoiceType] = useState<"soft" | "clear">("soft");
  const [lang, setLang] = useState<"en" | "fr">("en");

  const sectionStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 16,
  };

  const textStyle = {
    color: theme.colors.text,
    fontSize: 16,
  };

  useEffect(() => {
    (async () => {
      const storedTTS = await AsyncStorage.getItem("ttsEnabled");
      const storedVoice = await AsyncStorage.getItem("voiceType");
      const storedLang = await AsyncStorage.getItem("preferredLang");

      if (storedTTS !== null) setTtsEnabled(storedTTS === "true");
      if (storedVoice === "soft" || storedVoice === "clear") setVoiceType(storedVoice);
      if (storedLang === "en" || storedLang === "fr") setLang(storedLang);
    })();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
    Toast.show({ type: "success", text1: "Saved", text2: `${key} updated` });
  };

  return (
    <Form.List
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 64 }}
      contentInset={{ bottom: 24 }}
    >
      <Form.Section title="Appearance">
        <View style={{ ...sectionStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={textStyle}>Enable Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#E9E9EA", true: "#4D4D52" }}
            thumbColor={isDark ? "#E9E9EA" : "#FFFFFF"}
            ios_backgroundColor="#E9E9EA"
          />
        </View>
      </Form.Section>

      <Form.Section title="Speech Preferences">
        <View style={{ ...sectionStyle, gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={textStyle}>Enable TTS</Text>
            <Switch
              value={ttsEnabled}
              onValueChange={(val) => {
                setTtsEnabled(val);
                saveSetting("ttsEnabled", val.toString());
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={textStyle}>Voice Type</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => { setVoiceType("soft"); saveSetting("voiceType", "soft"); }}>
                <Text style={{ ...textStyle, opacity: voiceType === "soft" ? 1 : 0.5 }}>Soft</Text>
              </Pressable>
              <Pressable onPress={() => { setVoiceType("clear"); saveSetting("voiceType", "clear"); }}>
                <Text style={{ ...textStyle, opacity: voiceType === "clear" ? 1 : 0.5 }}>Clear</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={textStyle}>Preferred Language</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => { setLang("en"); saveSetting("preferredLang", "en"); }}>
                <Text style={{ ...textStyle, opacity: lang === "en" ? 1 : 0.5 }}>EN</Text>
              </Pressable>
              <Pressable onPress={() => { setLang("fr"); saveSetting("preferredLang", "fr"); }}>
                <Text style={{ ...textStyle, opacity: lang === "fr" ? 1 : 0.5 }}>FR</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Form.Section>

      <Form.Section title="Cognitive Aids">
        <Form.Link href="/settings/reminders" systemImage={"star.bubble"}>
          <View style={sectionStyle}>
            <Text style={textStyle}>Recall Reminders</Text>
          </View>
        </Form.Link>
      </Form.Section>

      <Form.Section title="Debug & Info">
        <Form.Link href="/_debug" systemImage={"ladybug"}>
          <View style={sectionStyle}>
            <Text style={textStyle}>Debug</Text>
          </View>
        </Form.Link>
        <Form.Link href="/_sitemap">
          <View style={sectionStyle}>
            <Text style={textStyle}>/_sitemap</Text>
          </View>
        </Form.Link>
      </Form.Section>
    </Form.List>
  );
}

// app/settings/tabs/emergency-call.tsx

import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { tw } from "@/util/tw";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const DEFAULT_NUMBERS = [
  { country: "USA", number: "911" },
  { country: "France", number: "112" },
  { country: "UK", number: "999" },
  { country: "Nigeria", number: "122" },
];

function callEmergency(number: string) {
  Speech.speak(`Are you sure you want to call ${number}?`, { language: "en" });
  Alert.alert(
    "Confirm Call",
    `Are you sure you want to call ${number}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => {
          Linking.openURL(`tel:${number}`);
        },
        style: "default",
      },
    ]
  );
}

export async function logEmergencyCall({ number, location }: { number: string; location?: string }) {
  await supabase.from("emergency_contacts").insert({
    number,
    location,
    called_at: new Date().toISOString(),
  });
}

export default function EmergencyCallTab() {
  const { theme } = useTheme();
  const [customNumber, setCustomNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [autoNumber, setAutoNumber] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      const userCountry = geo?.[0]?.isoCountryCode || "";
      setCountryCode(userCountry);

      const match = DEFAULT_NUMBERS.find(n => n.country.toLowerCase().includes(userCountry.toLowerCase()));
      if (match) {
        setAutoNumber(match.number);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[tw`p-4`, { gap: 16 }]}>
        <Text style={{ fontSize: 24, color: theme.colors.text, marginBottom: 8 }}>
          Emergency Contacts
        </Text>
        <Text style={{ color: theme.colors.text, opacity: 0.8, marginBottom: 16 }}>
          Tap a button to place a call to emergency services in your area.
        </Text>

        {autoNumber && (
          <Pressable
            onPress={() => callEmergency(autoNumber)}
            style={{
              backgroundColor: theme.colors.card,
              padding: 16,
              borderRadius: 12,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 18, color: theme.colors.text }}>📍 Auto-Detected Emergency Number</Text>
            <Text style={{ fontSize: 16, color: theme.colors.text, opacity: 0.7 }}>
              Based on your location ({countryCode}): {autoNumber}
            </Text>
          </Pressable>
        )}

        {DEFAULT_NUMBERS.map(({ country, number }) => (
          <Pressable
            key={number}
            onPress={() => callEmergency(number)}
            style={{
              backgroundColor: theme.colors.card,
              padding: 16,
              borderRadius: 12,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 18, color: theme.colors.text }}>{country}</Text>
            <Text style={{ fontSize: 16, color: theme.colors.text, opacity: 0.7 }}>
              Emergency Number: {number}
            </Text>
          </Pressable>
        ))}

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, color: theme.colors.text, marginBottom: 8 }}>
            Custom Emergency Contact
          </Text>
          <TextInput
            value={customNumber}
            onChangeText={setCustomNumber}
            placeholder="Enter a phone number"
            placeholderTextColor={theme.colors.border}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
            }}
          />
          <Pressable
            onPress={() => callEmergency(customNumber)}
            style={{
              backgroundColor: theme.colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Call Custom Number</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

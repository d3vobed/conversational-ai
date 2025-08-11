// BotTypingCard.tsx
import LottieView from "lottie-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "./ThemeProvider";

export function BotTypingCard() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        maxWidth: "80%",
        alignSelf: "flex-start",
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        marginVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: theme.colors.border,
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <LottieView
        source={require("../../assets/icons/typing.json")}
        autoPlay
        loop
        style={{ width: 40, height: 40 }}
      />
      <Text style={{ color: theme.colors.text, marginLeft: 8 }}>Typing...</Text>
    </View>
  );
}

"use client";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "./ui/ThemeProvider";

export function UserMessage({ children }: { children?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        flexDirection: "row",
        maxWidth: "100%",
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text
          numberOfLines={100}
          style={{
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 20,
            borderBottomRightRadius: 8,
            color: theme.colors.text,
            padding: 12,
            fontSize: 16,
            textAlign: "right",
          }}
          selectable
        >
          {children}
        </Text>
      </View>
    </View>
  );
}
import * as Form from "@/components/ui/Form";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Stack from "@/components/ui/Stack";
import ThemeProvider, { useTheme } from "@/components/ui/ThemeProvider";
import TouchableBounce from "@/components/ui/TouchableBounce";
import "@/global.css";
import { Link } from "expo-router";
import { View } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

export { ErrorBoundary } from "expo-router";

function LayoutNav() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        title: "Conversational AI",
          headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: "600",
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLargeStyle: {
            backgroundColor: theme.colors.background,
          },
          headerBlurEffect: undefined,
          headerTransparent: false,
          headerLeft: () => (
            <Link href="/settings" asChild>
              <TouchableBounce sensory>
                <View
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    alignItems: "center",
                    display: "flex",
                    marginLeft: process.env.EXPO_OS !== "web" ? -16 : 0,
                  }}
                >
                  <IconSymbol name="gear" color={theme.colors.text} />
                </View>
              </TouchableBounce>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          presentation: "formSheet",
          headerTransparent: true,
          headerRight: () => (
            <Form.Link headerRight href="/" dismissTo>
              <IconSymbol
                name="arrow.down.circle.fill"
                color={theme.colors.text}
                size={28}
              />
            </Form.Link>
          ),
        }}
      />
      {/* ADDED: Screen for managing reminders */}
      <Stack.Screen
        name="settings/reminders"
        options={{
          title: "Recall Reminders",
          presentation: "modal",
        }}
      />
      {/* Keep other screens as is */}
      <Stack.Screen name="_debug" options={{ presentation: "modal" }} />
      <Stack.Screen name="legal/privacy" options={{ presentation: "modal" }} />
      <Stack.Screen name="movie" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="settings/icon" sheet options={{ sheetGrabberVisible: false }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <LayoutNav />
    </ThemeProvider>
  );
}
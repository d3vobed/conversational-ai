
import { MemoryAidForm } from "@/components/memory-aid-form";
import { MemoryAidList } from "@/components/memory-aid-list";
import { useTheme } from "@/components/ui/ThemeProvider";
import { ScrollView, Text } from "react-native";

export default function MemoryAidScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: theme.colors.text,
          marginBottom: 16,
        }}
      >
        🧠 Memory Aid
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: theme.colors.text,
          opacity: 0.8,
          marginBottom: 24,
        }}
      >
        Store names, faces, or notes to help with memory recall.
      </Text>

      <MemoryAidForm
        lang="en"
        onDone={() => {
          alert("Memory aid saved!");
        } } sessionId={""}      />

      <MemoryAidList />
    </ScrollView>
  );
}
// components/memory-aid-list.tsx

import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export type MemoryAid = {
  id: string;
  name: string;
  description: string;
  language: string;
  created_at: string;
};

export function MemoryAidList() {
  const [items, setItems] = useState<MemoryAid[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("memory_aids").select("*").order("created_at", { ascending: false });
      if (error) console.error("Memory aid fetch error", error);
      else setItems(data);
    })();
  }, []);

  return (
    <View style={{ marginTop: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.colors.text, marginBottom: 8 }}>
        📋 Saved Memory Aids
      </Text>
      {items.length === 0 ? (
        <Text style={{ color: theme.colors.text, opacity: 0.6 }}>No memory aids saved yet.</Text>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: theme.colors.card,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.colors.text, fontWeight: "bold" }}>{item.name}</Text>
            <Text style={{ fontSize: 14, color: theme.colors.text, opacity: 0.8 }}>{item.description}</Text>
            <Text style={{ fontSize: 12, color: theme.colors.text, opacity: 0.5, marginTop: 4 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

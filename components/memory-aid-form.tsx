import { useTheme } from "@/components/ui/ThemeProvider";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function MemoryAidForm({
  onDone,
  lang = "en",
  sessionId,
}: {
  onDone: () => void;
  lang?: "en" | "fr";
  sessionId: string;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState(""); 
  const [type, setType] = useState("");   
  const [imageUrl, setImageUrl] = useState(""); 

  const labels = {
    en: {
      title: "Add Memory Aid",
      namePlaceholder: "e.g., John Smith",
      descPlaceholder: "e.g., My brother, wears glasses",
      labelPlaceholder: "Label (e.g., Family)",
      typePlaceholder: "Type (e.g., person/place)",
      imagePlaceholder: "Image URL (optional)",
      save: "Save Memory Aid",
      error: "Name and description are required.",
      success: "Memory Aid Saved",
    },
    fr: {
      title: "Ajouter une aide-mémoire",
      namePlaceholder: "par ex., Jean Dupont",
      descPlaceholder: "par ex., Mon frère, porte des lunettes",
      labelPlaceholder: "Étiquette (ex: Famille)",
      typePlaceholder: "Type (ex: personne/lieu)",
      imagePlaceholder: "URL de l'image (facultatif)",
      save: "Enregistrer l'aide-mémoire",
      error: "Nom et description requis.",
      success: "Aide-mémoire enregistré",
    },
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert(labels[lang].error);
      return;
    }

    const { error } = await supabase.from("memory_aids").insert({
      name,
      description,
      label,
      type,
      image_url: imageUrl,
      language: lang,
      created_at: new Date().toISOString(),
      user_id: sessionId,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(labels[lang].success);
      onDone();
    }
  };

  return (
<View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{labels[lang].title}</Text>

      <TextInput value={name} onChangeText={setName} placeholder={labels[lang].namePlaceholder}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
      <TextInput value={description} onChangeText={setDescription} placeholder={labels[lang].descPlaceholder}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} multiline />
      <TextInput value={label} onChangeText={setLabel} placeholder={labels[lang].labelPlaceholder}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
      <TextInput value={type} onChangeText={setType} placeholder={labels[lang].typePlaceholder}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />
      <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder={labels[lang].imagePlaceholder}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} />

      <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={{ color: "white", fontWeight: "bold" }}>{labels[lang].save}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 12, marginVertical: 8 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export async function logMemoryAid({
  name,
  description,
  language,
}: {
  name: string;
  description: string;
  language: string;
}) {
  await supabase.from("memory_aids").insert({
    name,
    description,
    language,
    created_at: new Date().toISOString(),
  });
}
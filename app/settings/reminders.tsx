import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/components/ui/ThemeProvider';
import TouchableBounce from '@/components/ui/TouchableBounce';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert, Button, FlatList, Image,
  StyleSheet, Text, TextInput, View
} from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY!;
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type ReminderItem = {
  id: string;
  text: string;
  image_uri?: string;
  audio_uri?: string;
  scheduled_for: string;
  created_at: string;
};

export default function RemindersScreen() {
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string>();
  const [audioUri, setAudioUri] = useState<string>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from("reminder_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setReminders(data as ReminderItem[]);
  };

  const scheduleNotification = async (text: string, triggerTime: number) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧠 Reminder",
        body: text,
      },
      trigger: { seconds: triggerTime, repeats: false },
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow microphone access.");
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(recordingOptions);
    setRecording(recording);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI() ?? undefined);
    setRecording(null);
  };

  const generateTTSAudio = async (text: string): Promise<string | undefined> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1',
          voice: 'alloy',
          input: text,
          response_format: 'mp3',
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );
      const path = FileSystem.documentDirectory + `tts-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(path, Buffer.from(response.data).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      return await uploadAudioToSupabase(path);
    } catch (err) {
      console.error('TTS error', err);
    }
  };

  const uploadAudioToSupabase = async (uri: string): Promise<string | undefined> => {
    const fileName = uri.split('/').pop()!;
    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage.from("reminders").upload(`audio/${fileName}`, file, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (error) return;

    const { data } = supabase.storage.from("reminders").getPublicUrl(`audio/${fileName}`);
    return data?.publicUrl;
  };

  const handleSaveReminder = async () => {
    if (!text.trim()) {
      Alert.alert("Missing Text", "Please enter something to remember.");
      return;
    }

    const now = new Date();
    const in5Seconds = new Date(now.getTime() + 5 * 1000).toISOString();

    let uploadedAudio = audioUri;
    if (!uploadedAudio) {
      uploadedAudio = await generateTTSAudio(text);
    }

    const { error } = await supabase.from("reminder_logs").insert({
      text,
      audio_uri: uploadedAudio,
      image_uri: imageUri,
      scheduled_for: in5Seconds,
      created_at: new Date().toISOString(),
    });

    if (!error) {
      await scheduleNotification(text, 5);
      fetchReminders();
      setText('');
      setAudioUri(undefined);
      setImageUri(undefined);
    } else {
      Alert.alert("Failed", error.message);
    }
  };

  const renderReminderItem = ({ item }: { item: ReminderItem }) => (
    <View style={styles.reminderCard}>
      <Text style={styles.reminderText}>{item.text}</Text>
      {item.image_uri && <Image source={{ uri: item.image_uri }} style={styles.reminderImage} />}
      {item.audio_uri && (
        <TouchableBounce onPress={() => playSound(item.audio_uri!)}>
          <IconSymbol name="play.circle.fill" size={32} color={theme.colors.primary} />
        </TouchableBounce>
      )}
    </View>
  );

  const playSound = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Create a Reminder</Text>
          <TextInput
            style={styles.input}
            value={text}
            placeholder="e.g., Take your meds"
            onChangeText={setText}
            placeholderTextColor={theme.colors.border}
          />
          <View style={styles.buttonContainer}>
            <Button title={imageUri ? "Change Image" : "Add Image"} onPress={pickImage} color={theme.colors.primary} />
            {recording ? (
              <Button title="Stop Recording" onPress={stopRecording} color="#FF453A" />
            ) : (
              <Button title="Record" onPress={startRecording} color={theme.colors.primary} />
            )}
            <Button title="Save" onPress={handleSaveReminder} color={theme.colors.primary} />
          </View>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        </View>
      }
      data={reminders}
      keyExtractor={(item) => item.id}
      renderItem={renderReminderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const recordingOptions = {
  android: { extension: '.m4a', outputFormat: 2, audioEncoder: 3, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000 },
  ios: { extension: '.caf', audioQuality: 2, sampleRate: 44100, numberOfChannels: 2, bitRate: 128000 },
  web: {},
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  inputContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  image: { width: 100, height: 100, borderRadius: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  reminderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  reminderText: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  reminderImage: { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
});

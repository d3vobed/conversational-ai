// lib/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  text: string;
  imageUri?: string;
  audioUri?: string;
  completed_at?: string;
}
const STORAGE_KEY = 'reminders';

export async function getReminders(): Promise<Reminder[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to fetch reminders:', e);
    return [];
  }
}

export async function saveReminder(reminder: Omit<Reminder, 'id'>): Promise<void> {
  try {
    const existing = await getReminders();
    const newReminder: Reminder = { ...reminder, id: uuidv4() };
    const updated = [newReminder, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save reminder:', e);
  }
}

export async function deleteReminder(id: string): Promise<void> {
  try {
    const existing = await getReminders();
    const filtered = existing.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete reminder:', e);
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Theme,
} from "@react-navigation/native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// Define our color palettes
const colors = {
  light: {
    primary: '#007AFF', // Vibrant Blue
    background: '#F2F2F7', // Off-white
    card: '#FFFFFF',
    text: '#000000',
    border: '#D1D1D6',
    notification: '#FF3B30',
  },
  dark: {
    primary: '#0A84FF', // Brighter Blue for dark bg
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
  },
  neutral: { // High-contrast neutral
    primary: '#485BFF',
    background: '#E5E5E5',
    card: '#F5F5F5',
    text: '#1A1A1A',
    border: '#BFBFBF',
    notification: '#D93636',
  }
};

const AppDefaultTheme: Theme = {
  dark: false,
  colors: colors.light,
  fonts: NavDefaultTheme.fonts,       // ← add this
};

const AppDarkTheme: Theme = {
  dark: true,
  colors: colors.dark,
  fonts: NavDarkTheme.fonts,          // ← add this
};
// You could add a neutral theme toggle as well
// const AppNeutralTheme: Theme = { ... };

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  theme: AppDefaultTheme,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === "dark");

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        setIsDark(systemTheme === 'dark');
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };
  
  // Use the navigation themes as a base and override with our colors
  const themeObject = {
      ...(isDark ? NavDarkTheme : NavDefaultTheme),
      colors: isDark ? AppDarkTheme.colors : AppDefaultTheme.colors,
  };

const baseTheme = isDark ? NavDarkTheme : NavDefaultTheme;
const appTheme: Theme = {
  ...baseTheme,
  dark: isDark,
  colors: isDark ? colors.dark : colors.light,
  fonts: baseTheme.fonts,
};

  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme: appTheme }}>
      <NavigationThemeProvider value={appTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

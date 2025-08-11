import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './ui/ThemeProvider';

export function BotMessage({
  children,
  sourceIcon,
  onRetry,
}: {
  children: React.ReactNode;
  sourceIcon?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.logoContainer, { backgroundColor: theme.colors.border }]}>
        <Image source={require("../assets/icons/awe.png")} style={styles.logo} />
      </View>
      <View style={[styles.bubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{children}</Text>
        {sourceIcon && (
          <Text style={[styles.sourceText, { color: theme.colors.text }]}>
            {sourceIcon}
          </Text>
        )}
        {onRetry && (
          <Pressable onPress={onRetry}>
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>↻ Continue</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  logo: {
    width: 20,
    height: 20,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  sourceText: {
    fontSize: 12,
    marginTop: 6,
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
  },
});

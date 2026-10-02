import { requireNativeModule } from "expo-modules-core";
import { useCallback, useEffect, useState } from "react";
import { AppState, StyleSheet, Text, useColorScheme, View } from "react-native";
const ClipzenNative = requireNativeModule("ClipzenNative");

type ClipboardEvent = {
  text: string;
};

export default function Index() {
  const [clipboardText, setClipboardText] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const refreshClipboard = useCallback(() => {
    const current = ClipzenNative.getCurrentClipboard();
    if (current) {
      setClipboardText(current);
    }
  }, []);

  useEffect(() => {
    // 1. Live changes while the app is focused
    const subscription = ClipzenNative.addListener(
      "onClipboardChanged",
      (event: ClipboardEvent) => setClipboardText(event.text),
    );

    // 2. Initial read
    refreshClipboard();

    // 3. Re-read when the app returns to the foreground
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        // small delay: window focus isn't always granted the instant the app is "active"
        setTimeout(refreshClipboard, 300);
      }
    });

    return () => {
      subscription.remove();
      appStateSub.remove();
    };
  }, [refreshClipboard]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#000000" : "#FFFFFF",
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: isDark ? "#FFFFFF" : "#000000",
          },
        ]}
      >
        CLIPZEN NEW
      </Text>

      <Text
        style={[
          styles.label,
          {
            color: isDark ? "#CCCCCC" : "#444444",
          },
        ]}
      >
        Current clipboard:
      </Text>

      <Text
        style={[
          styles.clipboardText,
          {
            color: isDark ? "#FFFFFF" : "#000000",
          },
        ]}
      >
        {clipboardText ?? "Nothing copied yet"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  label: {
    marginTop: 20,
    fontSize: 16,
  },

  clipboardText: {
    marginTop: 10,
    fontSize: 18,
  },
});

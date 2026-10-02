import { requireNativeModule } from "expo-modules-core";
import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const ClipzenNative = requireNativeModule("ClipzenNative");

type ClipboardEvent = {
  text: string;
};

export default function Index() {
  const [clipboardText, setClipboardText] =
    useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const refreshClipboard = useCallback(() => {
    const current =
      ClipzenNative.getCurrentClipboard();

    if (current) {
      setClipboardText(current);
    }
  }, []);

  useEffect(() => {
    // -------------------------------------------------------------------------
    // Clipboard
    // -------------------------------------------------------------------------

    const subscription =
      ClipzenNative.addListener(
        "onClipboardChanged",
        (event: ClipboardEvent) => {
          setClipboardText(event.text);
        },
      );

    // -------------------------------------------------------------------------
    // WebSocket connected
    // -------------------------------------------------------------------------

    const webSocketConnectedSubscription =
      ClipzenNative.addListener(
        "onWebSocketConnected",
        () => {
          console.log(
            "CLIPZEN: WebSocket connected",
          );
        },
      );

    // -------------------------------------------------------------------------
    // WebSocket message
    // -------------------------------------------------------------------------

    const webSocketMessageSubscription =
      ClipzenNative.addListener(
        "onWebSocketMessage",
        (event: { text: string }) => {
          console.log(
            "CLIPZEN: WebSocket message:",
            event.text,
          );
        },
      );

    // -------------------------------------------------------------------------
    // WebSocket disconnected
    // -------------------------------------------------------------------------

    const webSocketDisconnectedSubscription =
      ClipzenNative.addListener(
        "onWebSocketDisconnected",
        (event: {
          code: number;
          reason: string;
        }) => {
          console.log(
            "CLIPZEN: WebSocket disconnected:",
            event.code,
            event.reason,
          );
        },
      );

    // -------------------------------------------------------------------------
    // WebSocket error
    // -------------------------------------------------------------------------

    const webSocketErrorSubscription =
      ClipzenNative.addListener(
        "onWebSocketError",
        (event: { message: string }) => {
          console.log(
            "CLIPZEN: WebSocket error:",
            event.message,
          );
        },
      );

    // -------------------------------------------------------------------------
    // Initial clipboard
    // -------------------------------------------------------------------------

    refreshClipboard();

    // -------------------------------------------------------------------------
    // Connect to CLIPZEN server
    // -------------------------------------------------------------------------

    ClipzenNative.connectToServer(
      "ws://10.58.232.138:8080",
      "android-test-02",
    );

    // -------------------------------------------------------------------------
    // Refresh clipboard when app comes to foreground
    // -------------------------------------------------------------------------

    const appStateSub =
      AppState.addEventListener(
        "change",
        (state) => {
          if (state === "active") {
            setTimeout(
              refreshClipboard,
              300,
            );
          }
        },
      );

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    return () => {
      subscription.remove();

      appStateSub.remove();

      webSocketConnectedSubscription.remove();

      webSocketMessageSubscription.remove();

      webSocketDisconnectedSubscription.remove();

      webSocketErrorSubscription.remove();

      ClipzenNative.disconnectFromServer();
    };
  }, [refreshClipboard]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            isDark
              ? "#000000"
              : "#FFFFFF",
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color:
              isDark
                ? "#FFFFFF"
                : "#000000",
          },
        ]}
      >
        CLIPZEN NEW
      </Text>

      <Text
        style={[
          styles.label,
          {
            color:
              isDark
                ? "#CCCCCC"
                : "#444444",
          },
        ]}
      >
        Current clipboard:
      </Text>

      <Text
        style={[
          styles.clipboardText,
          {
            color:
              isDark
                ? "#FFFFFF"
                : "#000000",
          },
        ]}
      >
        {clipboardText ??
          "Nothing copied yet"}
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
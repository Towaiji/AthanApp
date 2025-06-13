import { Stack } from "expo-router";
import { LogBox, StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { LanguageProvider } from "../contexts/LanguageContext";

LogBox.ignoreAllLogs(true);

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ThemedStatusBar />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerTitle: "Not Found" }} />
          <Stack.Screen name="directions" options={{ headerTitle: "Directions" }} />
        </Stack>
      </LanguageProvider>
    </ThemeProvider>
  );
}

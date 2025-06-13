import { Stack } from "expo-router";
import { LogBox, StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";

LogBox.ignoreAllLogs(true);

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <ThemedStatusBar />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerTitle: "Not Found" }} />
          </Stack>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

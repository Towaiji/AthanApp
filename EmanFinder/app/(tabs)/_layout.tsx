import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TabsLayout() {
  const { colors, isDark, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
        tabBarItemStyle: {
          padding: 10,
          marginBottom: 5,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      }}
    >
      {/* Prayer Times Tab */}
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: t('prayerTimes'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="alarm" size={24} color={color} />
          ),
        }}
      />

      {/* Mosque Locator Tab */}
      <Tabs.Screen
        name="mosqueLocator"
        options={{
          headerTitle: t('findMosque'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="location-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Qibla Direction Tab */}
      <Tabs.Screen
        name="qiblaDirection"
        options={{
          headerTitle: t('qiblaDirection'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={24} color={color} />
          ),
        }}
      />
      {/* Quran Reader Tab */}
      <Tabs.Screen
        name="quran"
        options={{
          headerTitle: t('quran'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      {/* Daily Hadith Tab */}
      <Tabs.Screen
        name="hadith"
        options={{
          headerTitle: t('dailyHadith'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="reader-outline" size={24} color={color} />
          ),
        }}
      />
      {/* Zakat Tab */}
      <Tabs.Screen
        name="zakat"
        options={{
          headerTitle: t('zakat'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="cash-outline" size={24} color={color} />
          ),
        }}
      />
      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: t('settingsTab'),
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

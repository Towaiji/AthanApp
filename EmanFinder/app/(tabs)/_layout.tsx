import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#e91e63",  // You can adjust the color to match your theme
        tabBarInactiveTintColor: "#000",  // Adjust color
        tabBarStyle: {
          backgroundColor: "#fff7fe",  // Background color of the tab bar
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
          backgroundColor: "#fff7fe",  // Header background color
        },
      }}
    >
      {/* Prayer Times Tab */}
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Prayer Times",
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
          headerTitle: "Find Nearest Mosque",
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
          headerTitle: "Qibla Direction",
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
          headerTitle: 'Quran',
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      {/* Zakat Tab */}
      <Tabs.Screen
        name="zakat"
        options={{
          headerTitle: 'Zakat',
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
          headerTitle: "Settings",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/colors';

export default function DirectionsScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { lat, lng, name } = useLocalSearchParams<{ lat?: string; lng?: string; name?: string }>();
  const url = lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : 'https://www.google.com/maps';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: name ? `Directions to ${name}` : 'Directions' }} />
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />}
      />
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webview: { flex: 1 },
});

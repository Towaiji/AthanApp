// app/(tabs)/quran.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { useTheme } from '../../contexts/ThemeContext'
import { Colors } from '../../constants/colors'

export default function QuranScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      {/* you can point this to any Quran reader URL or local HTML */}
      <WebView 
        source={{ uri: 'https://quran.com/' }} 
        style={styles.webview} 
        startInLoadingState 
      />
    </View>
  )
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webview: { flex: 1 }
})


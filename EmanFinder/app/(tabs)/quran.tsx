// app/(tabs)/quran.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { colors } from '../../constants/colors'

export default function QuranScreen() {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webview: { flex: 1 }
})

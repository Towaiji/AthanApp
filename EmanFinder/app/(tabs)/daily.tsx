import React from 'react'
import { ScrollView, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Colors } from '../../constants/colors'
import { hadiths, adhkar } from '../../constants/daily'

export default function DailyScreen() {
  const { colors } = useTheme()
  const { t } = useLanguage()
  const styles = React.useMemo(() => createStyles(colors), [colors])

  const day = Math.floor(Date.now() / 86400000)
  const hadith = hadiths[day % hadiths.length]
  const dhikr = adhkar[day % adhkar.length]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('hadithOfTheDay')}</Text>
      <Text style={styles.text}>{hadith}</Text>
      <Text style={[styles.heading, { marginTop: 20 }]}>{t('dhikrOfTheDay')}</Text>
      <Text style={styles.dhikr}>{dhikr}</Text>
    </ScrollView>
  )
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.accent,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  dhikr: {
    fontSize: 24,
    textAlign: 'center',
    color: colors.primary,
    marginTop: 8,
  },
})

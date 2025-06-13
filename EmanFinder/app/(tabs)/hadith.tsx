import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../../constants/colors';

const hadiths = [
  'Actions are judged by intentions.',
  'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
  'Make things easy and do not make things difficult.',
  'The best among you are those who have the best manners and character.',
  'Allah does not look at your appearances or your possessions but He looks at your hearts and your deeds.'
];

export default function HadithScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [index, setIndex] = useState(Math.floor(Math.random() * hadiths.length));

  const next = () => {
    setIndex((prev) => (prev + 1) % hadiths.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hadithOfDay')}</Text>
      <Text style={styles.hadith}>{hadiths[index]}</Text>
      <TouchableOpacity onPress={next} style={styles.button}>
        <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>{t('anotherHadith')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  hadith: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

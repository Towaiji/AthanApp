// app/(tabs)/quran.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/colors';

type Surah = {
  number: number;
  name: string;
  ayahs: string[];
};

export default function QuranScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [offlineMode, setOfflineMode] = useState(false);
  const [surahInput, setSurahInput] = useState('');
  const [downloaded, setDownloaded] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('offlineSurahs').then((data) => {
      if (data) {
        try {
          setDownloaded(JSON.parse(data));
        } catch (e) {
          console.error('Failed to parse offline surahs', e);
        }
      }
    });
  }, []);

  const saveSurahs = async (items: Surah[]) => {
    setDownloaded(items);
    await AsyncStorage.setItem('offlineSurahs', JSON.stringify(items));
  };

  const downloadSurah = async () => {
    const number = parseInt(surahInput, 10);
    if (!number) {
      Alert.alert('Invalid Surah number');
      return;
    }
    try {
      // Only fetch Arabic
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
      const json = await res.json();
      if (!json.data || !json.data.ayahs) {
        throw new Error('Invalid response');
      }
      const surah: Surah = {
        number,
        name: json.data.englishName || json.data.name,
        ayahs: json.data.ayahs.map((a: any) => a.text),
      };
      const updated = downloaded.filter((s) => s.number !== number);
      updated.push(surah);
      await saveSurahs(updated);
      setSurahInput('');
      Alert.alert('Downloaded', `${surah.name} saved for offline use.`);
    } catch (err) {
      console.error(err);
      Alert.alert('Download failed', 'Could not fetch surah data');
    }
  };

  if (!offlineMode) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => setOfflineMode(true)}
          style={styles.toggleBtn}
        >
          <Text style={styles.toggleText}>Offline Mode</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: 'https://quran.com/' }}
          style={styles.webview}
          startInLoadingState
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          setOfflineMode(false);
          setSelectedSurah(null);
        }}
        style={styles.toggleBtn}
      >
        <Text style={styles.toggleText}>Online Mode</Text>
      </TouchableOpacity>
      <View style={styles.downloadBar}>
        <TextInput
          placeholder="Surah number"
          value={surahInput}
          onChangeText={setSurahInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity onPress={downloadSurah} style={styles.downloadBtn}>
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {downloaded.map((s) => (
          <View key={s.number} style={styles.itemRow}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setSelectedSurah(s)}
            >
              <Text style={styles.itemText}>
                {s.number}. {s.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Delete Surah',
                  `Delete "${s.name}" from offline storage?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        const filtered = downloaded.filter(
                          (x) => x.number !== s.number
                        );
                        await saveSurahs(filtered);
                        if (
                          selectedSurah &&
                          selectedSurah.number === s.number
                        ) {
                          setSelectedSurah(null);
                        }
                      },
                    },
                  ]
                );
              }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {selectedSurah && (
          <View style={styles.surahContainer}>
            {selectedSurah.ayahs.map((v, i) => (
              <Text key={i} style={styles.ayah}>
                {i + 1}. {v}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    webview: { flex: 1 },
    toggleBtn: {
      padding: 10,
      backgroundColor: colors.card,
      alignItems: 'center',
      borderRadius: 8,
      margin: 10,
    },
    toggleText: { color: colors.accent, fontWeight: '600' },
    downloadBar: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 6,
      marginRight: 6,
      color: colors.text,
    },
    downloadBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.accent,
      borderRadius: 6,
    },
    downloadText: { color: '#fff', fontWeight: '600' },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      marginHorizontal: 10,
      marginBottom: 8,
      padding: 10,
    },
    itemText: { color: colors.text },
    surahContainer: { padding: 10 },
    ayah: { marginBottom: 4, color: colors.text },
    deleteBtn: {
      marginLeft: 10,
      backgroundColor: '#ee4444',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    deleteText: { color: '#fff', fontWeight: 'bold' },
  });

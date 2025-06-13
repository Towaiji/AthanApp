import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants/colors';

interface Mosque {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

type Favorites = Record<string, Mosque>;

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Mosque[]>([]);
  const router = useRouter();

  const load = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteMosques');
      if (saved) {
        const obj: Favorites = JSON.parse(saved);
        setFavs(Object.values(obj));
      }
    } catch (e) {
      console.error('load favorites', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    const updated = favs.filter(m => m.id !== id);
    setFavs(updated);
    const store: Favorites = {};
    updated.forEach(m => { store[m.id] = m; });
    await AsyncStorage.setItem('favoriteMosques', JSON.stringify(store));
  };

  const openDirections = (m: Mosque) => {
    if (m.latitude && m.longitude) {
      router.push({ pathname: '/directions', params: { lat: String(m.latitude), lng: String(m.longitude), name: m.name } });
    }
  };

  const renderItem = ({ item }: { item: Mosque }) => (
    <TouchableOpacity style={styles.item} onPress={() => openDirections(item)}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.address}</Text>
        </View>
        <TouchableOpacity onPress={() => remove(item.id)}>
          <Ionicons name="trash" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Favorites' }} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : favs.length === 0 ? (
        <Text style={styles.empty}>No favourites saved.</Text>
      ) : (
        <FlatList data={favs} keyExtractor={i => i.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} />
      )}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },
  item: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});

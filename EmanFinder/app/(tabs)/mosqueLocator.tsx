// app/(tabs)/mosqueLocator.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
  Alert,
  TextInput
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const GOOGLE_PLACES_API_KEY = 'AIzaSyCPT7j2OT_1vO50ybyKQKCoCQNQ58A62MA';  // ← replace with your key

interface Mosque {
  id: string;
  name: string;
  distance: number | null;
  address: string;
  latitude?: number;
  longitude?: number;
}

type Favorites = Record<string, Mosque>;

const deg2rad = (deg: number) => deg * (Math.PI / 180);

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const langCodeMap = {
  english: 'en',
  arabic: 'ar',
  urdu: 'ur',
  french: 'fr',
  turkish: 'tr',
  indonesian: 'id',
  malay: 'ms',
  spanish: 'es',
};

const fetchNearby = async (lat: number, lng: number, languageCode: string, radiusKm = 10): Promise<Mosque[]> => {
  const radiusM = radiusKm * 1000;
  const url = 
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${lat},${lng}`
    + `&radius=${radiusM}`
    + `&type=mosque`
    + `&language=${languageCode}`
    + `&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') {
      throw new Error(json.error_message || json.status);
    }
    return json.results.map((p: any) => {
      const placeLat = p.geometry?.location?.lat;
      const placeLng = p.geometry?.location?.lng;
      const distance = placeLat && placeLng
        ? getDistanceInKm(lat, lng, placeLat, placeLng)
        : null;
      return {
        id: p.place_id,
        name: p.name || 'Unnamed',
        address: p.vicinity || p.formatted_address || 'Address N/A',
        distance,
        latitude: placeLat,
        longitude: placeLng,
      };
    })
    .sort((a: Mosque, b: Mosque) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } catch (err: any) {
    console.error('Places error', err);
    Alert.alert('Error', err.message || 'Failed to fetch mosques');
    return [];
  }
};

const openGoogleMaps = (address: string, lat?: number, lng?: number) => {
  if (Platform.OS === 'ios') {
    // try Google Maps app
    const gmUrl = lat && lng
      ? `comgooglemaps://?q=${lat},${lng}&zoom=15`
      : `comgooglemaps://?q=${encodeURIComponent(address)}`;
    const webUrl = lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    Linking.canOpenURL(gmUrl).then(supported => {
      return supported ? Linking.openURL(gmUrl) : Linking.openURL(webUrl);
    }).catch(() => {
      Linking.openURL(webUrl);
    });
  } else {
    // Android: use intent via google.navigation: or geo:
    const intentUrl = lat && lng
      ? `google.navigation:q=${lat},${lng}`
      : `geo:0,0?q=${encodeURIComponent(address)}`;
    const webUrl = lat && lng
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    Linking.canOpenURL(intentUrl).then(supported => {
      return supported ? Linking.openURL(intentUrl) : Linking.openURL(webUrl);
    }).catch(() => {
      Linking.openURL(webUrl);
    });
  }
};

export default function MosqueLocator() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(10);
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState('');
  const [favorites, setFavorites] = useState<Favorites>({});
  const [manualCoords, setManualCoords] = useState<{lat: number; lng: number} | null>(null);
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    const loadFavs = async () => {
      try {
        const saved = await AsyncStorage.getItem('favoriteMosques');
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavs();
  }, []);

  const load = async (isRefresh = false, latOverride?: number, lngOverride?: number) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      let lat = latOverride;
      let lng = lngOverride;
      if (lat == null || lng == null) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setLocation(loc.coords);
      } else {
        setLocation({ latitude: lat, longitude: lng } as any);
      }
      const list = await fetchNearby(
        lat,
        lng,
        langCodeMap[language],
        radius
      );
      setMosques(list);
      lastRefresh.current = Date.now();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (manualCoords) {
      load(false, manualCoords.lat, manualCoords.lng);
    } else {
      load();
    }
  }, [radius, manualCoords]);

  const onRefresh = () => {
    if (Date.now() - lastRefresh.current < 5000) {
      Alert.alert('Hold on', 'Please wait a few seconds before refreshing again.');
      return setRefreshing(false);
    }
    setRefreshing(true);
    manualCoords ? load(true, manualCoords.lat, manualCoords.lng) : load(true);
  };

  const searchAddress = async () => {
    if (!address) return;
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length === 0) {
        return Alert.alert('Not found', 'Could not geocode that address');
      }
      const { latitude, longitude } = results[0];
      setManualCoords({ lat: latitude, lng: longitude });
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to search');
    }
  };

  const toggleFavorite = (m: Mosque) => {
    setFavorites(prev => {
      const updated = { ...prev };
      if (updated[m.id]) {
        delete updated[m.id];
      } else {
        updated[m.id] = m;
      }
      AsyncStorage.setItem('favoriteMosques', JSON.stringify(updated)).catch(err => console.error('Save fav', err));
      return updated;
    });
  };

  const openDirections = (m: Mosque) => {
    if (m.latitude && m.longitude) {
      router.push({ pathname: '/directions', params: { lat: String(m.latitude), lng: String(m.longitude), name: m.name } });
    } else {
      openGoogleMaps(m.address);
    }
  };

  const openFavorites = () => {
    router.push('/favorites');
  };

  const useCurrentLocation = () => {
    setManualCoords(null);
    setAddress('');
    load(true);
  };

  const renderItem = ({ item }: { item: Mosque }) => {
    const dist = item.distance != null ? `${item.distance.toFixed(1)} km` : '';
    return (
      <TouchableOpacity style={styles.item} onPress={() => openDirections(item)}>
        <View style={styles.header}>
          <Ionicons name="navigate-outline" size={28} color={colors.accent} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{dist}  •  {item.address}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            <Ionicons
              name={favorites[item.id] ? 'star' : 'star-outline'}
              size={22}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const Radii = [5,10,20,50];

  return (
    <View style={styles.container}>
      <View style={styles.radiusBar}>
        {Radii.map(r => (
          <TouchableOpacity
            key={r}
            style={[ styles.radBtn, radius===r && styles.radBtnActive ]}
            onPress={() => setRadius(r)}
          >
            <Text style={[ styles.radTxt, radius===r && styles.radTxtActive ]}>{r} km</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.radBtn, showMap && styles.radBtnActive]}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons
            name={showMap ? 'list' : 'map'}
            size={20}
            color={showMap ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.radBtn} onPress={openFavorites}>
          <Ionicons name="star" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={searchAddress}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        {manualCoords && (
          <TouchableOpacity style={styles.locBtn} onPress={useCurrentLocation}>
            <Ionicons name="locate" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <Text style={styles.locText}>
          You: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      {loading && !refreshing && (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      )}

      {error && !loading && (
        <Text style={styles.error}>{error}</Text>
      )}

      {!loading && !error && mosques.length === 0 && (
        <Text style={styles.error}>No mosques within {radius} km</Text>
      )}

      {showMap ? (
        <MapView
          style={styles.map}
          showsUserLocation
          region={location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined}
        >
          {mosques.map(m => (
            m.latitude && m.longitude ? (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                title={m.name}
                description={m.address}
                onCalloutPress={() => openDirections(m)}
              />
            ) : null
          ))}
        </MapView>
      ) : (
        <FlatList
          data={mosques}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  radiusBar: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  radBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  radBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  radTxt: { fontSize: 14, color: colors.textSecondary },
  radTxtActive: { color: '#fff', fontWeight: '600' },

  locText: { textAlign: 'center', color: colors.textSecondary, marginBottom: 8 },

  error: { textAlign: 'center', color: colors.error, marginTop: 20 },

  map: { flex: 1 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    color: colors.text,
  },
  searchBtn: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  locBtn: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },

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


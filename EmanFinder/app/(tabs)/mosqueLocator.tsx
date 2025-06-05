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
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors } from '../../constants/colors';

const GOOGLE_PLACES_API_KEY = 'AIzaSyCPT7j2OT_1vO50ybyKQKCoCQNQ58A62MA';  // ← replace with your key

interface Mosque {
  id: string;
  name: string;
  distance: number | null;
  address: string;
  latitude?: number;
  longitude?: number;
}

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

const fetchNearby = async (lat: number, lng: number, radiusKm = 10): Promise<Mosque[]> => {
  const radiusM = radiusKm * 1000;
  const url = 
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${lat},${lng}`
    + `&radius=${radiusM}`
    + `&type=mosque`
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
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [radius, setRadius] = useState(10);
  const [showMap, setShowMap] = useState(false);
  const lastRefresh = useRef(0);

  const load = async (isRefresh = false, coords?: { latitude: number; longitude: number }) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      let locCoords = coords;
      if (!locCoords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        locCoords = loc.coords;
      }
      setLocation(locCoords as any);
      const list = await fetchNearby(locCoords.latitude, locCoords.longitude, radius);
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
    load();
  }, [radius]);

  const onRefresh = () => {
    if (Date.now() - lastRefresh.current < 5000) {
      Alert.alert('Hold on', 'Please wait a few seconds before refreshing again.');
      return setRefreshing(false);
    }
    setRefreshing(true);
    load(true);
  };

  const renderItem = ({ item }: { item: Mosque }) => {
    const dist = item.distance != null ? `${item.distance.toFixed(1)} km` : '';
    return (
      <TouchableOpacity style={styles.item} onPress={() => openGoogleMaps(item.address, item.latitude, item.longitude)}>
        <View style={styles.header}>
          <Ionicons name="navigate-outline" size={28} color={colors.accent} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{dist}  •  {item.address}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Radii = [5,10,20,50];

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <GooglePlacesAutocomplete
          placeholder="Search location"
          fetchDetails
          onPress={(data, details = null) => {
            const lat = details?.geometry?.location?.lat;
            const lng = details?.geometry?.location?.lng;
            if (lat && lng) {
              load(false, { latitude: lat, longitude: lng });
            }
          }}
          query={{ key: GOOGLE_PLACES_API_KEY, language: 'en' }}
          styles={{
            textInput: styles.searchInput,
            container: { flex: 0 },
          }}
        />
      </View>
      <View style={styles.topRow}>
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
        </View>
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons name={showMap ? 'list' : 'map'} size={22} color="#fff" />
        </TouchableOpacity>
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
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          initialRegion={location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined}
        >
          {mosques.map(m => (
            m.latitude && m.longitude && (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                title={m.name}
                description={m.address}
                onCalloutPress={() => openGoogleMaps(m.address, m.latitude, m.longitude)}
              />
            )
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, alignItems: 'center' },
  radiusBar: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  radBtn: {
    paddingHorizontal: 12, paddingVertical: 6, marginHorizontal: 4,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 20, backgroundColor: '#f0f0f0'
  },
  radBtnActive: {
    backgroundColor: colors.accent, borderColor: colors.accent
  },
  radTxt: { fontSize: 14, color: '#666' },
  radTxtActive: { color: '#fff', fontWeight: '600' },

  locText: { textAlign: 'center', color: '#666', marginBottom: 8 },

  error: { textAlign: 'center', color: colors.error, marginTop: 20 },

  map: { flex: 1 },
  mapToggle: { backgroundColor: colors.accent, padding: 10, borderRadius: 20 },

  searchBox: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { backgroundColor: '#fff', height: 40, paddingHorizontal: 8, borderRadius: 4 },

  item: {
    marginHorizontal: 16, marginVertical: 6,
    backgroundColor: '#fff', borderRadius: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  sub: { fontSize: 12, color: '#777', marginTop: 2 }
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location'; // Expo's Location API
import { Ionicons } from '@expo/vector-icons'; // For icons

// Mock data for nearby mosques - replace with actual API call
const MOCK_MOSQUES = [
  { id: '1', name: 'Masjid Al-Huda', distance: '1.2 km', address: '123 Main St, Cityville' },
  { id: '2', name: 'Islamic Center of Cityville', distance: '2.5 km', address: '456 Oak Ave, Cityville' },
  { id: '3', name: 'An-Noor Mosque', distance: '3.1 km', address: '789 Pine Rd, Cityville' },
];

// Function to simulate fetching nearby mosques
const fetchNearbyMosques = async (latitude: number, longitude: number) => {
  console.log(`Workspaceing mosques near: ${latitude}, ${longitude}`);
  // In a real app, you would make an API call here
  // For now, we'll return mock data after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_MOSQUES);
    }, 1500);
  });
};

export default function MosqueLocator() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mosques, setMosques] = useState<typeof MOCK_MOSQUES>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in your device settings to find nearby mosques.');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        const fetchedMosques: any = await fetchNearbyMosques(currentLocation.coords.latitude, currentLocation.coords.longitude);
        setMosques(fetchedMosques);
      } catch (error) {
        console.error("Error fetching location or mosques:", error);
        setErrorMsg('Could not fetch location or mosque data. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderMosqueItem = ({ item }: { item: typeof MOCK_MOSQUES[0] }) => (
    <View style={styles.mosqueItem}>
      <Ionicons name="moon" size={24} color="#006400" style={styles.mosqueIcon} />
      <View style={styles.mosqueDetails}>
        <Text style={styles.mosqueName}>{item.name}</Text>
        <Text style={styles.mosqueDistance}>{item.distance}</Text>
        <Text style={styles.mosqueAddress}>{item.address}</Text>
      </View>
      <TouchableOpacity style={styles.directionsButton} onPress={() => alert(`Opening directions to ${item.name}`)}>
        <Ionicons name="navigate-circle-outline" size={30} color="#e91e63" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text>Finding nearby mosques...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Could not determine your location.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Mosques</Text>
      {mosques.length > 0 ? (
        <FlatList
          data={mosques}
          renderItem={renderMosqueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.center}>
          <Text>No mosques found nearby, or still loading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7fe', // Matching your tab bar background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mosqueItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mosqueIcon: {
    marginRight: 15,
  },
  mosqueDetails: {
    flex: 1,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mosqueDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mosqueAddress: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  directionsButton: {
    padding: 5,
  }
});
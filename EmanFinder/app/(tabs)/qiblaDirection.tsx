import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location'; // Expo's Location API

// Kaaba coordinates in Mecca, Saudi Arabia
const KAABA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262,
};

// Function to calculate the Qibla direction
const calculateQiblaDirection = (userLat: number, userLon: number) => {
  const lat1 = userLat;
  const lon1 = userLon;
  const lat2 = KAABA_COORDS.latitude;
  const lon2 = KAABA_COORDS.longitude;

  // Formula to calculate the bearing (in degrees)
  const x = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  const bearing = Math.atan2(x, y) * (180 / Math.PI); // Convert to degrees
  return (bearing + 360) % 360; // Normalize the bearing between 0-360 degrees
};

const QiblaDirection = () => {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        const direction = calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude);
        setQiblaDirection(direction);
        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qibla Direction</Text>
      <Text style={styles.location}>
        Latitude: {location.latitude}, Longitude: {location.longitude}
      </Text>
      {qiblaDirection !== null ? (
        <Text style={styles.qibla}>
          Qibla Direction: {qiblaDirection.toFixed(2)}° from North
        </Text>
      ) : (
        <Text style={styles.qibla}>Calculating Qibla direction...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    fontSize: 18,
    marginBottom: 20,
  },
  qibla: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QiblaDirection;

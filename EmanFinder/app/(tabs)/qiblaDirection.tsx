import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location'; // Expo's Location API
import { Magnetometer } from 'expo-sensors'; // Expo's Magnetometer API
import { Ionicons } from '@expo/vector-icons'; // For icons

// Kaaba coordinates in Mecca, Saudi Arabia
const KAABA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262,
};

// Function to convert degrees to radians
const toRadians = (degrees: number) => degrees * (Math.PI / 180);

// Function to convert radians to degrees
const toDegrees = (radians: number) => radians * (180 / Math.PI);

// Function to calculate the Qibla direction (bearing from True North)
const calculateQiblaBearing = (userLat: number, userLon: number) => {
  const lat1 = toRadians(userLat);
  const lon1 = toRadians(userLon);
  const lat2 = toRadians(KAABA_COORDS.latitude);
  const lon2 = toRadians(KAABA_COORDS.longitude);

  const deltaLon = lon2 - lon1;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  
  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360 degrees
  return bearing;
};

// Function to get heading from magnetometer data
const getHeadingFromMagnetometer = (magnetometerData: { x: number; y: number; z: number } | null) => {
  if (!magnetometerData) return 0;
  const { x, y } = magnetometerData;
  let heading = Math.atan2(y, x);
  heading = toDegrees(heading);
  heading = (heading + 360) % 360; // Normalize
  // Adjust for device orientation and declination if needed for higher accuracy.
  // For a basic compass, this is a starting point.
  // Note: This heading is Magnetic North. For True North, you'd need magnetic declination.
  // For simplicity, we'll treat this as approximate True North or assume declination is small.
  return heading;
};


export default function QiblaDirection() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [magnetometerData, setMagnetometerData] = useState<{ x: number; y: number; z: number } | null>(null);
  const [subscription, setSubscription] = useState<any>(null); // For magnetometer subscription

  useEffect(() => {
    const initializeCompass = async () => {
      setLoading(true);
      // 1. Get Location Permissions & Data
      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        setErrorMsg('Location permission denied. Qibla direction cannot be determined.');
        setLoading(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation(loc.coords);
        const bearing = calculateQiblaBearing(loc.coords.latitude, loc.coords.longitude);
        setQiblaBearing(bearing);
      } catch (e) {
        console.error("Error fetching location:", e);
        setErrorMsg('Could not fetch location. Please ensure GPS is enabled.');
        setLoading(false);
        return;
      }

      // 2. Check Magnetometer Availability & Subscribe
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        setErrorMsg('Compass (Magnetometer) is not available on this device.');
        setLoading(false);
        return;
      }
      
      Magnetometer.setUpdateInterval(500); // Update every 500ms
      const magSubscription = Magnetometer.addListener(setMagnetometerData);
      setSubscription(magSubscription);
      
      setLoading(false);
    };

    initializeCompass();

    // Cleanup: Unsubscribe when component unmounts
    return () => {
      subscription && subscription.remove();
    };
  }, []);

  const deviceHeading = getHeadingFromMagnetometer(magnetometerData);
  // The compass needle should point to Qibla relative to the device's top.
  // So, if North is at `deviceHeading` and Qibla is at `qiblaBearing` (both from True North),
  // the needle needs to rotate by `qiblaBearing - deviceHeading`.
  const qiblaPointerRotation = qiblaBearing !== null ? qiblaBearing - deviceHeading : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text>Initializing Qibla Compass...</Text>
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
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qibla Direction</Text>
      {userLocation && (
        <Text style={styles.infoText}>
          Your Location: Lat {userLocation.latitude.toFixed(2)}, Lon {userLocation.longitude.toFixed(2)}
        </Text>
      )}
      {qiblaBearing !== null && (
        <Text style={styles.infoText}>
          Qibla Bearing: {qiblaBearing.toFixed(1)}° from North
        </Text>
      )}
       <Text style={styles.infoText}>
          Device Heading: {deviceHeading.toFixed(1)}°
        </Text>

      <View style={styles.compassContainer}>
        {/* Static North Indicator (Could be a letter 'N' or an upward arrow) */}
        <Ionicons name="arrow-up-circle" size={40} color="grey" style={styles.northIndicator} />
        <Text style={styles.northText}>N</Text>

        {/* Qibla Pointer Arrow */}
        {qiblaBearing !== null && (
          <View style={[styles.qiblaPointerContainer, { transform: [{ rotate: `${qiblaPointerRotation}deg` }] }]}>
            <Ionicons name="arrow-up-circle-outline" size={180} color="#e91e63" />
          </View>
        )}
         <View style={styles.compassCenterDot} />
      </View>
      
      {qiblaBearing !== null && (
         <Text style={styles.instructions}>
            Align the <Text style={{color: "#e91e63", fontWeight: 'bold'}}>PINK arrow</Text> with the <Text style={{color: "grey", fontWeight: 'bold'}}>GREY 'N' (North)</Text> marker on the top.
            The Pink arrow then points to the Qibla.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff7fe', // Matching your tab bar background
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  compassContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    position: 'relative', // Needed for absolute positioning of elements inside
    // borderWidth: 1, // For debugging layout
    // borderColor: 'lightgrey',
    // borderRadius: 125, // Make it circular
  },
  northIndicator: {
    position: 'absolute',
    top: 10, // Position it at the top of the compass container
    alignSelf: 'center',
  },
  northText: {
    position: 'absolute',
    top: 45, // Position it at the top of the compass container
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'grey',
  },
  qiblaPointerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    // The actual pointer is the icon inside, positioned to point "up" by default
    // transform origin is center by default for rotate
  },
  // You could use an Image for a nicer compass arrow:
  // qiblaArrow: {
  //   width: 30,
  //   height: 150, // Adjust size as needed
  //   resizeMode: 'contain',
  // },
   compassCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    position: 'absolute', // Center it
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    color: '#444',
  }
});
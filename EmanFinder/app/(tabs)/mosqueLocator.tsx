import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  // Image, // Image was not used, can be removed if not needed later
  RefreshControl,
  Linking,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// --- Configuration ---
// IMPORTANT: Replace with your actual Google Places API Key
const GOOGLE_PLACES_API_KEY = 'AIzaSyCPT7j2OT_1vO50ybyKQKCoCQNQ58A62MA';
// ---------------------

// Window dimensions for responsive design
const windowWidth = Dimensions.get('window').width;

// Interface for the mosque data we expect after processing API response
interface Mosque {
  id: string; // Corresponds to place_id from Google API
  name: string;
  distance: number | null; // Distance in km
  address: string; // Corresponds to vicinity or formatted_address
  // Google Places API doesn't directly provide prayer times or detailed facilities in Nearby Search.
  // These would require a secondary Place Details request and parsing potentially unstructured data.
  // For this integration, we'll acknowledge they might not be available or use placeholders.
  prayer_times?: { [key: string]: string }; // Optional: Placeholder if you find a way to get this data
  hasFacilities?: string[]; // Optional: Placeholder
  phone?: string; // From Place Details (formatted_phone_number)
  website?: string; // From Place Details
  latitude?: number;
  longitude?: number;
}

// Function to calculate distance between two lat/lng points (Haversine formula)
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};


// Function to fetch nearby mosques from Google Places API
const fetchRealNearbyMosques = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Mosque[]> => {
  const radiusMeters = radiusKm * 1000; // Convert km to meters for API
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=mosque&key=${GOOGLE_PLACES_API_KEY}`;

  console.log(`Workspaceing from: ${url}`); // For debugging

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results.map((place: any) => {
        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;
        let distance = null;
        if (placeLat && placeLng) {
          distance = getDistanceInKm(latitude, longitude, placeLat, placeLng);
        }

        // Basic details from Nearby Search
        const mosqueData: Mosque = {
          id: place.place_id,
          name: place.name || 'Unnamed Mosque',
          address: place.vicinity || 'Address not available',
          distance: distance,
          latitude: placeLat,
          longitude: placeLng,
          // Phone and website usually require a Place Details request.
          // We'll leave them undefined for now or you can make additional calls.
        };
        // To get phone/website, you'd make a Place Details request here for each place_id
        // e.g., `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website&key=${GOOGLE_PLACES_API_KEY}`
        // And then populate mosqueData.phone and mosqueData.website

        return mosqueData;
      }).sort((a: Mosque, b: Mosque) => (a.distance || Infinity) - (b.distance || Infinity)); // Sort by distance
    } else if (data.status === "ZERO_RESULTS") {
      console.log("No mosques found by API.");
      return [];
    } else {
      console.error('Google Places API Error:', data.status, data.error_message);
      Alert.alert('API Error', `Could not fetch mosques: ${data.error_message || data.status}`);
      return [];
    }
  } catch (error) {
    console.error('Network error fetching mosques:', error);
    Alert.alert('Network Error', 'Failed to connect to the mosque finding service.');
    return [];
  }
};


// --- Helper Functions (openDirections, callMosque, openWebsite) remain the same ---
const openDirections = (address: string, lat?: number, lng?: number) => {
  let query = encodeURIComponent(address);
  let url = '';

  if (lat && lng) {
    // If lat/lng are available, use them for more precise navigation
    query = `${lat},${lng}`;
    url = Platform.select({
        ios: `maps:0,0?q=&ll=${query}`,
        android: `geo:${query}?q=${query}`,
    })!;
  } else {
    // Fallback to address-based query
    url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`,
    })!;
  }
  
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(address)}`;
        return Linking.openURL(webUrl);
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'Could not open maps application.');
      console.error('An error occurred opening maps', err);
    });
};

const callMosque = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device');
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'Could not open phone dialer');
      console.error('An error occurred opening dialer', err);
    });
};

const openWebsite = (website: string) => {
  // Ensure the website URL has a scheme
  const fullUrl = website.startsWith('http://') || website.startsWith('https://')
    ? website
    : `http://${website}`;

  Linking.canOpenURL(fullUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', 'Cannot open this website');
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'Could not open website');
      console.error('An error occurred opening website', err);
    });
};


// --- FacilityIcon component remains the same ---
const FacilityIcon = ({ type }: { type: string }) => {
  let iconName: any = 'help-circle-outline'; // Default icon
  let iconColor = '#666';

  switch (type) {
    case 'parking': iconName = 'car-outline'; iconColor = '#3498db'; break;
    case 'wudu': iconName = 'water-outline'; iconColor = '#2ecc71'; break;
    case 'women_section': iconName = 'woman-outline'; iconColor = '#e91e63'; break;
    case 'classroom': iconName = 'book-outline'; iconColor = '#f39c12'; break;
    case 'library': iconName = 'library-outline'; iconColor = '#9b59b6'; break;
    // Add more cases as needed if you can source this data
    default: iconName = 'ellipse-outline'; iconColor = '#888'; // Generic facility
  }

  return (
    <View style={styles.facilityIcon}>
      <Ionicons name={iconName} size={16} color={iconColor} />
    </View>
  );
};

export default function MosqueLocator() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]); // Use the new Mosque interface
  const [refreshing, setRefreshing] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius
  const [expandedMosqueId, setExpandedMosqueId] = useState<string | null>(null);

  const lastRefreshTime = useRef<number>(0);

  const loadMosques = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true); else setRefreshing(true);
    setErrorMsg(null); // Clear previous errors

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in your device settings to find nearby mosques.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Can be adjusted: High, Balanced, Low, Lowest
      });
      setLocation(currentLocation.coords);

      const fetchedMosques = await fetchRealNearbyMosques(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        searchRadius
      );
      setMosques(fetchedMosques);
      lastRefreshTime.current = Date.now();

    } catch (error: any) {
      console.error("Error in loadMosques:", error);
      setErrorMsg(error.message || 'Could not fetch your location or find nearby mosques. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMosques();
  }, [searchRadius]); // Re-fetch when searchRadius changes

  const onRefresh = () => {
    const now = Date.now();
    if (now - lastRefreshTime.current < 5000 && !__DEV__) { // Allow more frequent refresh in DEV
      Alert.alert('Please wait', 'Refreshing too frequently. Please try again in a few seconds.');
      setRefreshing(false);
      return;
    }
    loadMosques(true); // Pass true to indicate it's a refresh
  };

  const toggleMosqueDetails = (id: string) => {
    setExpandedMosqueId(expandedMosqueId === id ? null : id);
  };

  // --- renderFacilities remains the same, but data might be less available ---
  const renderFacilities = (facilities?: string[]) => {
    if (!facilities || facilities.length === 0) {
      return <Text style={styles.detailText}>Facility information not available.</Text>;
    }
    return (
      <View style={styles.facilitiesContainer}>
        {facilities.map((facility, index) => (
          <FacilityIcon key={index} type={facility} />
        ))}
      </View>
    );
  };

  const renderMosqueItem = ({ item }: { item: Mosque }) => {
    const isExpanded = expandedMosqueId === item.id;

    return (
      <TouchableOpacity
        style={[styles.mosqueItem, isExpanded && styles.expandedMosqueItem]}
        onPress={() => toggleMosqueDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.mosqueHeader}>
          <View style={styles.mosqueIconContainer}>
            {/* You might want a more generic icon if mosque-specific icons aren't available */}
            <Ionicons name="navigate-circle-outline" size={24} color="#006400" />
          </View>

          <View style={styles.mosqueInfo}>
            <Text style={styles.mosqueName}>{item.name}</Text>
            {item.distance !== null && (
                 <Text style={styles.mosqueDistance}>{item.distance.toFixed(1)} km away</Text>
            )}
            <Text style={styles.mosqueAddress} numberOfLines={2}>{item.address}</Text>
          </View>

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Prayer Times - This data is not directly available from Nearby Search */}
            <View style={styles.prayerTimesContainer}>
              <Text style={styles.sectionTitle}>Prayer Times</Text>
              {item.prayer_times ? (
                <View style={styles.prayerGrid}>
                  {Object.entries(item.prayer_times).map(([prayer, time]) => (
                    <View key={prayer} style={styles.prayerTime}>
                      <Text style={styles.prayerName}>{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</Text>
                      <Text style={styles.prayerTimeText}>{time}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailText}>Prayer time information not available for this location via API.</Text>
              )}
            </View>

            {/* Facilities - This data is not directly available from Nearby Search */}
            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              {renderFacilities(item.hasFacilities)}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openDirections(item.address, item.latitude, item.longitude)}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>

              {item.phone && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonCall]}
                  onPress={() => callMosque(item.phone!)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
              )}

              {item.website && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonWebsite]}
                  onPress={() => openWebsite(item.website!)}
                >
                  <Ionicons name="globe" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Website</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- renderRadiusOptions remains the same ---
   const renderRadiusOptions = () => {
    const options = [5, 10, 20, 50]; // Radii in km
    return (
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Search radius:</Text>
        <View style={styles.radiusOptions}>
          {options.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusButton,
                searchRadius === radius && styles.activeRadiusButton
              ]}
              onPress={() => setSearchRadius(radius)}
            >
              <Text
                style={[
                  styles.radiusButtonText,
                  searchRadius === radius && styles.activeRadiusButtonText
                ]}
              >
                {radius} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };


  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Finding nearby mosques...</Text>
      </View>
    );
  }

  if (errorMsg && !loading) { // Only show error if not also loading
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadMosques()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Nearby Mosques</Text> */}
      {/* Title is now in the header from _layout.tsx, so we might not need it here */}

      {renderRadiusOptions()}

      {location && (
        <Text style={styles.locationText}>
          Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      {!loading && mosques.length === 0 && !errorMsg && ( // Show "No results" only if not loading and no error
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={64} color="#999" />
          <Text style={styles.noResultsText}>No mosques found within {searchRadius}km</Text>
          <Text style={styles.noResultsSubtext}>Try increasing your search radius or check your connection.</Text>
        </View>
      )}

      {mosques.length > 0 && (
          <FlatList
            data={mosques}
            renderItem={renderMosqueItem}
            keyExtractor={(item) => item.id} // Use Google's place_id as key
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#e91e63"]} // Match your theme
              />
            }
          />
      )}
    </View>
  );
}

// --- Styles remain largely the same, with minor adjustments as needed ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7fe',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff7fe',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // title: { // Removed as it's in the header
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   marginTop: 16,
  //   marginBottom: 10,
  //   textAlign: 'center',
  //   color: '#333',
  // },
  locationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  radiusContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  radiusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  radiusOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radiusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeRadiusButton: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  radiusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeRadiusButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mosqueItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  expandedMosqueItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#006400', // Keep your theme
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  mosqueIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff', // A light, neutral color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mosqueInfo: {
    flex: 1,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mosqueDistance: {
    fontSize: 14,
    color: '#e91e63', // Theme color for distance
    fontWeight: '500',
    marginTop: 2,
  },
  mosqueAddress: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  expandedContent: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa', // Slightly different background for expanded area
  },
  prayerTimesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  prayerGrid: { // Styles for prayer times if you manage to get this data
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTime: {
    width: '48%', // Adjust for layout
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#006400', // Theme
  },
  prayerName: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  prayerTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  detailText: { // For "not available" messages
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  facilitiesSection: {
    marginBottom: 16,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityIcon: { // Same as before
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Adjusted for potentially fewer buttons
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006400', // Main action color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexGrow: 1, // Allow buttons to grow
    marginHorizontal: 4,
  },
  actionButtonCall: {
    backgroundColor: '#3498db', // Specific color for call
  },
  actionButtonWebsite: {
    backgroundColor: '#9b59b6', // Specific color for website
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50, // Give some space from header/radius options
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  }
});
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Window dimensions for responsive design
const windowWidth = Dimensions.get('window').width;

// Enhanced mock data - in a real app, you'd fetch from an API
const MOCK_MOSQUES = [
  { 
    id: '1', 
    name: 'Masjid Al-Huda', 
    distance: 1.2, 
    address: '123 Main St, Cityville',
    prayer_times: { fajr: '5:15 AM', dhuhr: '12:30 PM', asr: '3:45 PM', maghrib: '6:52 PM', isha: '8:15 PM' },
    hasFacilities: ['parking', 'wudu', 'women_section'],
    phone: '+1234567890',
    website: 'https://masjidalhuda.org'
  },
  { 
    id: '2', 
    name: 'Islamic Center of Cityville', 
    distance: 2.5, 
    address: '456 Oak Ave, Cityville',
    prayer_times: { fajr: '5:20 AM', dhuhr: '12:35 PM', asr: '3:50 PM', maghrib: '6:55 PM', isha: '8:20 PM' },
    hasFacilities: ['parking', 'wudu', 'women_section', 'classroom'],
    phone: '+1234567891',
    website: 'https://iccityville.org'
  },
  { 
    id: '3', 
    name: 'An-Noor Mosque', 
    distance: 3.1, 
    address: '789 Pine Rd, Cityville',
    prayer_times: { fajr: '5:10 AM', dhuhr: '12:25 PM', asr: '3:40 PM', maghrib: '6:50 PM', isha: '8:10 PM' },
    hasFacilities: ['parking', 'wudu'],
    phone: '+1234567892',
    website: 'https://annoor.org'
  },
  { 
    id: '4', 
    name: 'Masjid As-Salam', 
    distance: 4.3, 
    address: '101 Cedar Blvd, Cityville',
    prayer_times: { fajr: '5:18 AM', dhuhr: '12:33 PM', asr: '3:48 PM', maghrib: '6:54 PM', isha: '8:18 PM' },
    hasFacilities: ['parking', 'wudu', 'women_section', 'classroom', 'library'],
    phone: '+1234567893',
    website: 'https://assalam.org'
  },
  { 
    id: '5', 
    name: 'Downtown Islamic Center', 
    distance: 5.7, 
    address: '222 Maple St, Cityville',
    prayer_times: { fajr: '5:12 AM', dhuhr: '12:27 PM', asr: '3:42 PM', maghrib: '6:51 PM', isha: '8:12 PM' },
    hasFacilities: ['parking', 'women_section'],
    phone: '+1234567894',
    website: 'https://downtownic.org'
  }
];

// Function to simulate fetching nearby mosques with more realistic data
const fetchNearbyMosques = async (latitude: number, longitude: number, radius: number = 10) => {
  console.log(`Searching mosques near: ${latitude}, ${longitude} within ${radius} km`);
  
  // In a real app, you would make an API call here using the coordinates and radius
  // For example:
  // const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius*1000}&type=mosque&key=YOUR_API_KEY`);
  // const data = await response.json();
  
  // For now, we'll return the mock data with a simulated delay
  return new Promise((resolve) => {
    // Simulate network request
    setTimeout(() => {
      // Sort by distance
      const sortedMosques = [...MOCK_MOSQUES].sort((a, b) => a.distance - b.distance);
      resolve(sortedMosques);
    }, 1000);
  });
};

// Function to open navigation to the mosque
const openDirections = (address: string) => {
  // Format the query string for maps
  const query = encodeURIComponent(address);
  
  // Create the appropriate URL based on the platform
  const url = Platform.select({
    ios: `maps:0,0?q=${query}`,
    android: `geo:0,0?q=${query}`,
  });
  
  // Check if we can open the URL
  Linking.canOpenURL(url!)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url!);
      } else {
        // Fallback to Google Maps on the web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        return Linking.openURL(webUrl);
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'Could not open maps application.');
      console.error('An error occurred', err);
    });
};

// Function to open phone dialer
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
      console.error('An error occurred', err);
    });
};

// Function to open website
const openWebsite = (website: string) => {
  Linking.canOpenURL(website)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(website);
      } else {
        Alert.alert('Error', 'Cannot open this website');
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'Could not open website');
      console.error('An error occurred', err);
    });
};

// Custom component to display facility icons
const FacilityIcon = ({ type }: { type: string }) => {
  let iconName: any = 'help-circle-outline';
  let iconColor = '#666';
  
  switch (type) {
    case 'parking':
      iconName = 'car-outline';
      iconColor = '#3498db';
      break;
    case 'wudu':
      iconName = 'water-outline';
      iconColor = '#2ecc71';
      break;
    case 'women_section':
      iconName = 'woman-outline';
      iconColor = '#e91e63';
      break;
    case 'classroom':
      iconName = 'book-outline';
      iconColor = '#f39c12';
      break;
    case 'library':
      iconName = 'library-outline';
      iconColor = '#9b59b6';
      break;
    default:
      iconName = 'add-circle-outline';
      iconColor = '#666';
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
  const [mosques, setMosques] = useState<typeof MOCK_MOSQUES>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius
  const [expandedMosqueId, setExpandedMosqueId] = useState<string | null>(null);
  
  // Ref to store last refresh time to prevent too frequent refreshes
  const lastRefreshTime = useRef<number>(0);

  const loadMosques = async () => {
    try {
      setLoading(true);
      
      // Check location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied. Please enable it in your device settings to find nearby mosques.');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation.coords);
      
      // Fetch mosques based on current location
      const fetchedMosques: any = await fetchNearbyMosques(
        currentLocation.coords.latitude, 
        currentLocation.coords.longitude,
        searchRadius
      );
      setMosques(fetchedMosques);
      
      // Update last refresh time
      lastRefreshTime.current = Date.now();
      
    } catch (error) {
      console.error("Error fetching location or mosques:", error);
      setErrorMsg('Could not fetch your location or find nearby mosques. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMosques();
  }, [searchRadius]);
  
  const onRefresh = () => {
    // Prevent refreshing too frequently (minimum 5 seconds between refreshes)
    const now = Date.now();
    if (now - lastRefreshTime.current < 5000) {
      Alert.alert('Please wait', 'Refreshing too frequently. Please try again in a few seconds.');
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    loadMosques();
  };
  
  const toggleMosqueDetails = (id: string) => {
    setExpandedMosqueId(expandedMosqueId === id ? null : id);
  };

  const renderFacilities = (facilities: string[]) => {
    return (
      <View style={styles.facilitiesContainer}>
        {facilities.map((facility, index) => (
          <FacilityIcon key={index} type={facility} />
        ))}
      </View>
    );
  };

  const renderMosqueItem = ({ item }: { item: typeof MOCK_MOSQUES[0] }) => {
    const isExpanded = expandedMosqueId === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.mosqueItem, isExpanded && styles.expandedMosqueItem]}
        onPress={() => toggleMosqueDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.mosqueHeader}>
          <View style={styles.mosqueIconContainer}>
            <Ionicons name="moon" size={24} color="#006400" />
          </View>
          
          <View style={styles.mosqueInfo}>
            <Text style={styles.mosqueName}>{item.name}</Text>
            <Text style={styles.mosqueDistance}>{item.distance.toFixed(1)} km away</Text>
            <Text style={styles.mosqueAddress}>{item.address}</Text>
          </View>
          
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </View>
        
        {/* Expanded details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.prayerTimesContainer}>
              <Text style={styles.sectionTitle}>Prayer Times</Text>
              <View style={styles.prayerGrid}>
                {Object.entries(item.prayer_times).map(([prayer, time]) => (
                  <View key={prayer} style={styles.prayerTime}>
                    <Text style={styles.prayerName}>{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</Text>
                    <Text style={styles.prayerTimeText}>{time}</Text>
                  </View>
                ))}
              </View>
            </View>

            {item.hasFacilities && (
              <View style={styles.facilitiesSection}>
                <Text style={styles.sectionTitle}>Facilities</Text>
                {renderFacilities(item.hasFacilities)}
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openDirections(item.address)}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
              
              {item.phone && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonCall]}
                  onPress={() => callMosque(item.phone)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
              )}
              
              {item.website && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.actionButtonWebsite]}
                  onPress={() => openWebsite(item.website)}
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

  const renderRadiusOptions = () => {
    const options = [5, 10, 20, 50];
    
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

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMosques}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Mosques</Text>
      
      {renderRadiusOptions()}
      
      {location && (
        <Text style={styles.locationText}>
          Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}
      
      {mosques.length > 0 ? (
        <FlatList
          data={mosques}
          renderItem={renderMosqueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#e91e63"]}
            />
          }
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={64} color="#999" />
          <Text style={styles.noResultsText}>No mosques found within {searchRadius}km</Text>
          <Text style={styles.noResultsSubtext}>Try increasing your search radius</Text>
        </View>
      )}
    </View>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
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
    borderLeftColor: '#006400',
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
    backgroundColor: '#f0f8ff',
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
    color: '#e91e63',
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
    backgroundColor: '#fafafa',
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
  prayerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTime: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#006400',
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
  facilitiesSection: {
    marginBottom: 16,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityIcon: {
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006400',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonCall: {
    backgroundColor: '#3498db',
  },
  actionButtonWebsite: {
    backgroundColor: '#9b59b6',
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
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  }
});
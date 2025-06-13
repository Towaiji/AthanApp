import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { schedulePrayerNotifications } from '../../utils/notifications';

// Function to format time in a readable format
const formatTime = (timeString: string) => {
  // Convert 24-hour format to 12-hour format with AM/PM
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Function to get current date in nice format
const getCurrentDate = () => {
  const date = new Date();
  const options = { weekday: 'long' as const, year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };
  return date.toLocaleDateString(undefined, options);
};

// Function to get current Islamic date using Aladhan API
const getIslamicDate = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    const data = await response.json();
    const hijriDate = data.data.date.hijri;
    return `${hijriDate.month.en} ${hijriDate.day}, ${hijriDate.year} AH`;
  } catch (error) {
    console.error('Error fetching Islamic date:', error);
    return "Unable to fetch Islamic date";
  }
};

// Which prayer time is current or next
const getCurrentPrayerInfo = (prayerTimes: { [key: string]: string }) => {
  if (!prayerTimes) return { current: null, next: null };
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // We only want the 5 main prayers plus sunrise
  const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayers = prayerNames.filter(prayer => prayerTimes[prayer]);
  
  let currentPrayer = null;
  let nextPrayer = null;
  
  // Convert prayer times to minutes for comparison
  const prayerTimesInMinutes: { [key: string]: number } = {};
  for (const prayer of prayers) {
    const time = prayerTimes[prayer];
    const [hourStr, minuteStr] = time.split(':');
    const [hour, minute] = [parseInt(hourStr), parseInt(minuteStr)];
    prayerTimesInMinutes[prayer] = hour * 60 + minute;
  }
  
  // Find current and next prayer
  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];
    const prayerTimeInMinutes = prayerTimesInMinutes[prayer];
    
    if (currentTimeInMinutes < prayerTimeInMinutes) {
      nextPrayer = prayer;
      if (i > 0) {
        currentPrayer = prayers[i - 1];
      } else {
        // If we're before the first prayer of the day, current is the last prayer of previous day
        currentPrayer = prayers[prayers.length - 1];
      }
      break;
    }
  }
  
  // If we've gone through all prayers and haven't found a next prayer,
  // it means the next prayer is the first prayer of the next day
  if (!nextPrayer) {
    nextPrayer = prayers[0];
    currentPrayer = prayers[prayers.length - 1];
  }
  
  return { current: currentPrayer, next: nextPrayer };
};

// Calculate time until next prayer
const getTimeUntilNextPrayer = (prayerTimes: { [key: string]: string }, nextPrayer: string) => {
  if (!prayerTimes || !nextPrayer) return "";
  
  const now = new Date();
  const nextPrayerTime = prayerTimes[nextPrayer];
  const [hourStr, minuteStr] = nextPrayerTime.split(':');
  const [hour, minute] = [parseInt(hourStr), parseInt(minuteStr)];
  
  const nextPrayerDate = new Date();
  nextPrayerDate.setHours(hour, minute, 0);
  
  // If next prayer is tomorrow
  if (nextPrayerDate < now) {
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
  }
  
  const diffMs = nextPrayerDate.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};

// Function to fetch prayer times from Aladhan API
const fetchPrayerTimes = async (latitude: number, longitude: number) => {
  try {
    // Make an actual API call to Aladhan API
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract only the needed prayer times from the API response
    const timings = data.data.timings;
    
    // Return only the main prayer times we want to display
    return {
      Fajr: timings.Fajr,
      Sunrise: timings.Sunrise,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

export default function PrayerTimes() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [islamicDate, setIslamicDate] = useState<string>("Loading...");
  const [locationName, setLocationName] = useState<string>("");
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    prayerAlerts: true,
    reminderTime: '15',
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // Get location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      
      // Get current location
      let locationResult = await Location.getCurrentPositionAsync({});
      setLocation(locationResult.coords);
      
      // Try to get location name using reverse geocoding
      try {
        const geoAddress = await Location.reverseGeocodeAsync({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        });
        
        if (geoAddress && geoAddress.length > 0) {
          const address = geoAddress[0];
          setLocationName(
            [address.city, address.region, address.country]
              .filter(Boolean)
              .join(', ')
          );
        }
      } catch (geoError) {
        console.error('Error getting location name:', geoError);
      }
      
      // Fetch prayer times using location
      const times = await fetchPrayerTimes(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );
      setPrayerTimes(times);
      if (settings.notificationsEnabled && settings.prayerAlerts) {
        await schedulePrayerNotifications(times, parseInt(settings.reminderTime, 10));
      }
      
      // Fetch Islamic date
      const hijriDate = await getIslamicDate(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );
      setIslamicDate(hijriDate);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch prayer times. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings({
            notificationsEnabled: parsed.notificationsEnabled ?? true,
            prayerAlerts: parsed.prayerAlerts ?? true,
            reminderTime: parsed.reminderTime ?? '15',
          });
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setSettingsLoaded(true);
        fetchData();
      }
    };
    init();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const { current: currentPrayer, next: nextPrayer } = prayerTimes 
    ? getCurrentPrayerInfo(prayerTimes) 
    : { current: null, next: null };
  
  const timeUntilNext = prayerTimes && nextPrayer 
    ? getTimeUntilNextPrayer(prayerTimes, nextPrayer) 
    : "";

  if ((loading && !refreshing) || !settingsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchData}>Tap to retry</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.accent]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.dateText}>{getCurrentDate()}</Text>
        <Text style={styles.islamicDateText}>{islamicDate}</Text>
        {locationName ? <Text style={styles.locationNameText}>{locationName}</Text> : null}
      </View>
      
      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer}</Text>
          <Text style={styles.nextPrayerTime}>
            {prayerTimes && nextPrayer ? formatTime(prayerTimes[nextPrayer]) : ''}
          </Text>
          <Text style={styles.countdownText}>
            {timeUntilNext} remaining
          </Text>
        </View>
      )}
      
      <View style={styles.prayerTimesContainer}>
        <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
        
        {prayerTimes && Object.entries(prayerTimes).map(([prayer, time]) => {
          const isCurrent = prayer === currentPrayer;
          const isNext = prayer === nextPrayer;
          
          return (
            <View 
              key={prayer}
              style={[
                styles.timeRow,
                isCurrent && styles.currentPrayer,
                isNext && styles.nextPrayerRow
              ]}
            >
              <View style={styles.prayerIconContainer}>
                {isCurrent ? (
                  <Ionicons name="time" size={24} color={colors.accent} />
                ) : prayer === 'Fajr' ? (
                  <Ionicons name="sunny-outline" size={24} color="#FF9800" />
                ) : prayer === 'Sunrise' ? (
                  <Ionicons name="partly-sunny-outline" size={24} color="#FF9800" />
                ) : prayer === 'Dhuhr' ? (
                  <Ionicons name="sunny" size={24} color="#FF9800" />
                ) : prayer === 'Asr' ? (
                  <Ionicons name="partly-sunny" size={24} color="#FF9800" />
                ) : prayer === 'Maghrib' ? (
                  <Ionicons name="moon-outline" size={24} color="#3F51B5" />
                ) : prayer === 'Isha' ? (
                  <Ionicons name="moon" size={24} color="#3F51B5" />
                ) : (
                  <Ionicons name="sunny" size={24} color="#FF9800" />
                )}
              </View>
              
              <Text style={[
                styles.prayerName,
                isCurrent && styles.currentText,
                isNext && styles.nextText
              ]}>
                {prayer}
                {isCurrent && <Text style={styles.currentBadge}> (Current)</Text>}
              </Text>
              
              <Text style={[
                styles.time,
                isCurrent && styles.currentText,
                isNext && styles.nextText
              ]}>
                {formatTime(time)}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.locationInfo}>
        {location && (
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.apiCreditText}>
          Powered by Aladhan API
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    fontSize: 16,
    color: colors.accent,
    marginTop: 20,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
  },
  islamicDateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  locationNameText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  nextPrayerCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  nextPrayerTime: {
    fontSize: 36,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
  },
  countdownText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  prayerTimesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  currentPrayer: {
    backgroundColor: colors.highlight,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  nextPrayerRow: {
    backgroundColor: colors.border,
  },
  prayerIconContainer: {
    marginRight: 12,
    width: 30,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: colors.text,
  },
  time: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  currentText: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  nextText: {
    fontWeight: '500',
  },
  currentBadge: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
  },
  locationInfo: {
    padding: 16,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  apiCreditText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
});


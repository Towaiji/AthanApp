import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Function to format time in a readable format
const formatTime = (timeString: string) => {
  return timeString;
};

// Function to get current date in nice format
const getCurrentDate = () => {
  const date = new Date();
  const options = { weekday: 'long' as const, year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };
  return date.toLocaleDateString(undefined, options);
};

// Function to get current Islamic date (in a real app you'd use a proper Hijri calendar library)
const getIslamicDate = () => {
  return "Ramadan 15, 1445 AH"; // Example - would be dynamic in a real app
};

// Which prayer time is current or next
const getCurrentPrayerInfo = (prayerTimes: { [key: string]: string }) => {
  if (!prayerTimes) return { current: null, next: null };
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  const prayers = Object.keys(prayerTimes);
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
    // For a real app, you'd make an API call like:
    // const response = await fetch(
    //   `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
    // );
    // const data = await response.json();
    // return data.data.timings;
    
    // For now, return mock data but with better formatting
    return {
      Fajr: '05:15',
      Sunrise: '06:32',
      Dhuhr: '12:30',
      Asr: '15:45',
      Maghrib: '18:52',
      Isha: '20:15',
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
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
      
      // Fetch prayer times using location
      const times = await fetchPrayerTimes(
        locationResult.coords.latitude,
        locationResult.coords.longitude
      );
      setPrayerTimes(times);
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
    fetchData();
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

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
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
          colors={["#e91e63"]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.dateText}>{getCurrentDate()}</Text>
        <Text style={styles.islamicDateText}>{getIslamicDate()}</Text>
      </View>
      
      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer}</Text>
          <Text style={styles.nextPrayerTime}>
            {prayerTimes && nextPrayer ? prayerTimes[nextPrayer] : ''}
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
                  <Ionicons name="time" size={24} color="#e91e63" />
                ) : prayer === 'Fajr' ? (
                  <Ionicons name="sunny-outline" size={24} color="#FF9800" />
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
      </View>
    </ScrollView>
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
    backgroundColor: '#fff7fe',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
  islamicDateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  nextPrayerCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
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
    color: '#666',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  nextPrayerTime: {
    fontSize: 36,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  countdownText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  prayerTimesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  currentPrayer: {
    backgroundColor: '#FAE3EB',
    borderLeftWidth: 4,
    borderLeftColor: '#e91e63',
  },
  nextPrayerRow: {
    backgroundColor: '#f0f0f0',
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
    color: '#333',
  },
  time: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  currentText: {
    color: '#e91e63',
    fontWeight: 'bold',
  },
  nextText: {
    fontWeight: '500',
  },
  currentBadge: {
    fontSize: 12,
    color: '#e91e63',
    fontStyle: 'italic',
  },
  locationInfo: {
    padding: 16,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
});
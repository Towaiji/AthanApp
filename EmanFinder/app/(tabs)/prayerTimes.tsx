import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// You can use an API like Aladhan API for prayer times (or hardcode for testing)
const fetchPrayerTimes = async () => {
  // Mock API request - replace with actual API call
  return {
    Fajr: '5:00 AM',
    Dhuhr: '12:30 PM',
    Asr: '3:45 PM',
    Maghrib: '6:50 PM',
    Isha: '8:15 PM',
  };
};

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPrayerTimes = async () => {
      const times = await fetchPrayerTimes();
      setPrayerTimes(times);
      setLoading(false);
    };
    getPrayerTimes();
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
      <Text style={styles.title}>Today's Prayer Times</Text>
      {Object.keys(prayerTimes).map((prayer) => (
        <View key={prayer} style={styles.timeRow}>
          <Text style={styles.prayerName}>{prayer}</Text>
          <Text style={styles.time}>{prayerTimes[prayer]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 18,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

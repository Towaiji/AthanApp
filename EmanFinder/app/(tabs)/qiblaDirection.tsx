import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { QiblaFinder } from 'react-native-qibla-finder';

export default function QiblaCompassScreen() {
  return (
    <View style={styles.container}>
      <QiblaFinder
        // Size & styling for the compass view
        style={styles.compass}
        compassStyle={styles.compass}
        // Text style for the N/E/S/W labels
        compassDirectionTextStyle={styles.directionText}
        // Text style for the Qibla degree label
        qiblaDirectionTextStyle={styles.directionText}
        // Color & size of the loading spinner
        showLoadingIndicator
        loadingIndicatorSize={60}
        loadingIndicatorColor="#e91e63"
        // Show both compass and Qibla needle
        showCompassDirection
        showQiblaDirection
        // Handle any errors (e.g. permissions denied)
        onError={(err) => {
          console.error('QiblaFinder error:', err);
          Alert.alert('Error', err);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: 300,
    height: 300,
  },
  directionText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

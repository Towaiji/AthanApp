# EmanFinder / Athan App

A mobile application built with Expo and React Native for daily Islamic practices. All source code lives inside the `EmanFinder` folder.

## Features

- **Prayer Times**
  - Gets prayer timings from the Aladhan API based on your current location
  - Shows the current and next prayer with a countdown timer
  - Pull down to refresh the timings
- **Mosque Locator**
  - Finds nearby mosques using the Google Places API
  - Supports opening directions in Google Maps
- **Qibla Direction**
  - Uses `react-native-qibla-finder` to display a compass pointing to the Qibla
- **Quran Reader**
  - Embedded WebView that loads Quran.com
- **Daily Hadith**
  - Simple screen showing a random hadith with a refresh button
- **Settings**
  - Configure notifications, calculation method, appearance, and location options
  - Choose from several languages including English, Arabic, Urdu, French, Turkish and Spanish

## Technologies Used

- **Expo** and **React Native** for cross‑platform development
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Google Places API** and **Aladhan API** for external data
- Additional Expo modules such as `expo-location` and `react-native-webview`

## Getting Started

```bash
cd EmanFinder
npm install
npx expo start
```

Follow the Expo CLI instructions to run on an emulator, a device, or the web.

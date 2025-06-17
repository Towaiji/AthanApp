# EmanFinder / Athan App

A mobile application built with Expo and React Native for daily Islamic practices. All source code lives inside the `EmanFinder` folder.

## Features

- **Prayer Times**
- Gets prayer timings from the Aladhan API based on your current location
- Shows the current and next prayer with a countdown timer
- Pull down to refresh the timings
- Receive prayer time notifications with customizable reminders
- **Mosque Locator**
  - Finds nearby mosques using the Google Places API
  - Search by entering an address and switch back to your current location
  - Save favourite mosques and view them on the Favorites screen
  - Provides in-app directions via a web view
- **Qibla Direction**
  - Uses `react-native-qibla-finder` to display a compass pointing to the Qibla
- **Islamic Calendar**
  - Lists upcoming events like Ramadan and Eid based on the Hijri date
  - Accessible from the Prayer Times tab via the *Islamic Calendar* button
- **Quran Reader**
  - Web-based reader for online access
  - Download specific surahs or translations for offline use
- **Settings**
  - Configure notifications, calculation method, appearance, language and location options

## Technologies Used

- **Expo** and **React Native** for cross‑platform development
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Google Places API** and **Aladhan API** for external data
- Additional Expo modules such as `expo-location`, `expo-notifications` and `react-native-webview`

## Getting Started

```bash
cd EmanFinder
npm install
npx expo start
```

Follow the Expo CLI instructions to run on an emulator, a device, or the web.

## Localization

The app currently ships with translations for English, Arabic, Urdu, French and
Turkish. This update adds Indonesian, Malay and Spanish support. If you'd like
to help translate EmanFinder into other languages, feel free to submit a pull
request.

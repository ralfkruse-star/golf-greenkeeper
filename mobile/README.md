# Golf Greenkeeper Mobile App

React Native mobile application for the Golf Greenkeeper Management System.

## Features

- 📱 **Native iOS & Android** support via Expo
- 🔐 **JWT Authentication** with secure token storage
- 📊 **Dashboard** with real-time KPIs
- ✓ **Task Management** with filters and status tracking
- 🚜 **Equipment Tracking** with operating hours
- 📦 **Material Inventory** with stock levels
- 📷 **QR Code Scanner** for equipment and materials
- 🔄 **Pull-to-refresh** on all screens
- 📡 **Offline support** (coming soon)

## Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (Windows/Mac/Linux)

## Installation

```bash
cd mobile
npm install
```

## Configuration

Update the API URL in each screen file:

```typescript
const API_URL = 'http://your-api-url:3000/api';
```

For local development:
- **iOS Simulator**: `http://localhost:3000/api`
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **Physical Device**: `http://YOUR_LOCAL_IP:3000/api`

## Running the App

### Start Expo Dev Server

```bash
npm start
```

### iOS (Mac only)

```bash
npm run ios
```

Or press `i` in the Expo dev server terminal.

### Android

```bash
npm run android
```

Or press `a` in the Expo dev server terminal.

### Web (for testing)

```bash
npm run web
```

## Screens

### LoginScreen
- Email/password authentication
- JWT token storage
- Error handling

### DashboardScreen
- KPI cards (Tasks, Equipment, Materials, Weather)
- Quick action buttons
- Pull-to-refresh

### TasksScreen
- Task list with filters (ALL, TODO, IN_PROGRESS, COMPLETED)
- Status badges and priority indicators
- Zone and due date display
- Floating action button for creating tasks

### EquipmentScreen
- Equipment list (coming soon)
- Status tracking
- Operating hours

### MaterialsScreen
- Material inventory (coming soon)
- Stock levels
- Low stock alerts

### ScannerScreen
- QR code scanning with camera
- Auto-fetch item details
- Support for Equipment, Zones, Materials

## Project Structure

```
mobile/
├── App.tsx                 # Root component with navigation
├── package.json            # Dependencies
├── src/
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── TasksScreen.tsx
│       ├── EquipmentScreen.tsx
│       ├── MaterialsScreen.tsx
│       └── ScannerScreen.tsx
└── README.md
```

## Dependencies

- **expo**: ~50.0.0 - Expo framework
- **react-native**: 0.73.0 - React Native core
- **@react-navigation**: Navigation library
- **axios**: HTTP client for API calls
- **@react-native-async-storage**: Secure storage for tokens
- **expo-camera**: Camera API for QR scanning
- **expo-barcode-scanner**: Barcode/QR code scanning

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## Troubleshooting

### Cannot connect to API
- Ensure the backend server is running
- Check the API_URL in screen files
- For physical devices, use your local network IP

### Camera permission denied
- iOS: Check Settings > Privacy > Camera
- Android: Check Settings > Apps > Permissions > Camera

### Dependencies not installing
- Clear cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Future Enhancements

- [ ] Offline mode with local storage
- [ ] Push notifications for task assignments
- [ ] Weather forecasts
- [ ] Maps integration for zone visualization
- [ ] Photo uploads for task completion
- [ ] Equipment maintenance reminders
- [ ] Material order requests
- [ ] Real-time updates via WebSocket

## License

ISC

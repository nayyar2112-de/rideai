# 🚗 Ride AI — Voice-Powered Ride Booking App

A React Native (Expo) mobile app for booking rides using **voice commands + agentic AI**.

---

## 📱 Screens

| Screen | Description |
|---|---|
| **Home** | Voice mic hub, quick commands, recent rides |
| **Location** | Pickup & drop-off input with map preview |
| **Vehicle** | Ride type selection with live fare breakdown |
| **Matching** | AI driver matching animation with reasoning |
| **Tracking** | Live ETA countdown, status phases, driver card, rating |

---

## 🎙️ Voice Features

- Tap mic → simulated STT → intent parsing → AI action
- TTS responses via `expo-speech` on every key action
- Quick command chips: Airport, Office, Mall, Hospital, Station, SUV
- Intent types: `SET_DESTINATION`, `SELECT_VEHICLE`, `BOOK_RIDE`, `CANCEL_RIDE`, `ASK_ETA`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator, or Expo Go app

### Install & Run

```bash
cd ride-ai-app
npm install
npx expo start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with **Expo Go** app on your phone

---

## 📁 Project Structure

```
ride-ai-app/
├── App.js                     # Navigation root (Stack navigator)
├── app.json                   # Expo config
├── babel.config.js
├── package.json
│
├── constants/
│   └── theme.js               # Colors, spacing, radius tokens
│
├── services/
│   └── voiceAI.js             # Intent parser + TTS (expo-speech)
│
├── components/
│   ├── VoiceButton.js         # Animated mic button with pulse rings
│   ├── AIBubble.js            # Typewriter AI response bubble
│   ├── DriverCard.js          # Driver info card with call/chat
│   └── MapPreview.js          # Animated map route placeholder
│
└── screens/
    ├── HomeScreen.js          # Voice hub + recent rides
    ├── LocationScreen.js      # Pickup/dropoff + suggestions
    ├── VehicleScreen.js       # 3 ride options + fare breakdown
    ├── MatchingScreen.js      # AI matching animation + driver reveal
    └── TrackingScreen.js      # Live tracking + phases + rating
```

---

## 🔮 Production Upgrades

| Feature | Technology |
|---|---|
| Real STT | `expo-av` + Whisper API or Google STT |
| Real LLM intent | OpenAI GPT-4o / watsonx.ai |
| Real maps | `react-native-maps` + Google Maps API |
| Real driver matching | WebSocket + backend matching engine |
| Payments | Stripe / Razorpay SDK |
| Auth | Firebase Auth / Supabase |
| Push notifications | Expo Notifications |

---

## 🎨 Design

Dark theme — `#0f0f13` background, `#6c63ff` accent, `#ff6584` secondary.
All components use React Native core (no external UI library required).

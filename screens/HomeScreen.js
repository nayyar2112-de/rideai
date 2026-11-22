// screens/HomeScreen.js — Voice command hub
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceButton from '../components/VoiceButton';
import AIBubble from '../components/AIBubble';
import { speak, parseIntent, AI_RESPONSES } from '../services/voiceAI';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const QUICK_COMMANDS = [
  { label: '✈️  Airport', cmd: 'book a ride to the airport' },
  { label: '💼  Office', cmd: 'take me to tech park office' },
  { label: '🛍️  Mall', cmd: 'going to the mall' },
  { label: '🏥  Hospital', cmd: 'need a ride to hospital' },
  { label: '🚂  Station', cmd: 'railway station please' },
  { label: '🚐  Big car, bags', cmd: 'I need an SUV, have 3 bags' },
];

export default function HomeScreen({ navigation }) {
  const [listening, setListening] = useState(false);
  const [aiMessage, setAiMessage] = useState(AI_RESPONSES.greeting);
  const [showBubble, setShowBubble] = useState(true);
  const [rideData, setRideData] = useState({ pickup: '123 Main Street, Downtown', destination: '' });

  // Fake STT simulation cycle
  const simulatedPhrases = [
    'Book me a ride to the airport',
    'I need an SUV, 3 bags',
    'Take me to the mall',
    'Get me to the railway station',
  ];
  const phraseIndex = useRef(0);

  function handleMicPress() {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    setShowBubble(false);

    const phrase = simulatedPhrases[phraseIndex.current % simulatedPhrases.length];
    phraseIndex.current++;

    setTimeout(() => {
      setListening(false);
      processCommand(phrase);
    }, 2000);
  }

  function processCommand(text) {
    const intent = parseIntent(text);

    switch (intent.intent) {
      case 'SET_DESTINATION': {
        const msg = AI_RESPONSES.destinationSet(intent.destination);
        setAiMessage(msg);
        setShowBubble(true);
        speak(msg);
        setTimeout(() => {
          navigation.navigate('Vehicle', {
            pickup: rideData.pickup,
            destination: intent.destination,
          });
        }, 2000);
        break;
      }
      case 'BOOK_RIDE': {
        const msg = "Where would you like to go?";
        setAiMessage(msg);
        setShowBubble(true);
        speak(msg);
        navigation.navigate('Location', { pickup: rideData.pickup });
        break;
      }
      default: {
        const msg = AI_RESPONSES.unknown;
        setAiMessage(msg);
        setShowBubble(true);
        speak(msg);
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Ride<Text style={styles.logoAccent}>AI</Text></Text>
          <View style={styles.headerRight}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.muted} />
            <View style={styles.avatar}><Text>👤</Text></View>
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.subtitle}>Tap the mic and tell me where you want to go</Text>

        {/* AI response bubble */}
        <AIBubble message={aiMessage} visible={showBubble} />

        {/* Voice button */}
        <View style={styles.micContainer}>
          <VoiceButton listening={listening} onPress={handleMicPress} size={80} />
          <Text style={styles.micLabel}>
            {listening ? '🔴  Listening...' : 'Tap to speak'}
          </Text>
        </View>

        {/* Quick commands */}
        <Text style={styles.sectionTitle}>Quick Commands</Text>
        <View style={styles.commandGrid}>
          {QUICK_COMMANDS.map((item) => (
            <TouchableOpacity
              key={item.cmd}
              style={styles.commandChip}
              onPress={() => processCommand(item.cmd)}
            >
              <Text style={styles.commandText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual booking button */}
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => navigation.navigate('Location', { pickup: rideData.pickup })}
        >
          <Ionicons name="map-outline" size={18} color={COLORS.text} />
          <Text style={styles.manualBtnText}>Enter destination manually</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>

        {/* Recent rides */}
        <Text style={styles.sectionTitle}>Recent Rides</Text>
        {[
          { dest: 'International Airport', date: 'Yesterday · $12.50', emoji: '✈️' },
          { dest: 'Central Mall', date: '2 days ago · $8.00', emoji: '🛍️' },
          { dest: 'Tech Park', date: '3 days ago · $6.50', emoji: '💼' },
        ].map((r) => (
          <TouchableOpacity
            key={r.dest}
            style={styles.recentRow}
            onPress={() => navigation.navigate('Vehicle', { pickup: rideData.pickup, destination: r.dest })}
          >
            <View style={styles.recentIcon}><Text style={{ fontSize: 20 }}>{r.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentDest}>{r.dest}</Text>
              <Text style={styles.recentDate}>{r.date}</Text>
            </View>
            <Ionicons name="refresh-outline" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  logo: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  logoAccent: { color: COLORS.accent },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  greeting: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: SPACING.lg },
  micContainer: { alignItems: 'center', marginVertical: SPACING.xl },
  micLabel: { marginTop: SPACING.md, fontSize: 14, color: COLORS.muted },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  commandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  commandChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  commandText: { fontSize: 13, color: COLORS.text },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  manualBtnText: { flex: 1, fontSize: 15, color: COLORS.text },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  recentIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  recentDest: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  recentDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
});

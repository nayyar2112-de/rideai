// screens/MatchingScreen.js — AI driver matching animation
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DriverCard from '../components/DriverCard';
import AIBubble from '../components/AIBubble';
import { speak, AI_RESPONSES } from '../services/voiceAI';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const MOCK_DRIVER = {
  name: 'Rahul Sharma',
  emoji: '👨',
  rating: '4.92',
  trips: '1,284',
  plate: 'KA-05-MN-3421',
  car: 'Silver Honda City',
  eta: 4,
};

const MATCHING_STEPS = [
  'Scanning 24 nearby drivers...',
  'Filtering by rating ≥ 4.5...',
  'Checking route familiarity...',
  'Calculating ETA accuracy...',
  'Found your perfect driver! ✅',
];

export default function MatchingScreen({ navigation, route }) {
  const { pickup, destination, vehicle } = route.params;
  const [phase, setPhase] = useState(0);        // 0=matching, 1=found
  const [stepIdx, setStepIdx] = useState(0);
  const [aiMsg, setAiMsg] = useState('');
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  // Spinning ring
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Step progression
  useEffect(() => {
    const steps = MATCHING_STEPS.length;
    const interval = setInterval(() => {
      setStepIdx((i) => {
        const next = i + 1;
        if (next >= steps) {
          clearInterval(interval);
          return i;
        }
        return next;
      });
    }, 700);

    // After all steps done, show driver
    const showDriver = setTimeout(() => {
      setPhase(1);
      const msg = AI_RESPONSES.driverFound(MOCK_DRIVER.name, MOCK_DRIVER.rating, MOCK_DRIVER.eta);
      setAiMsg(msg);
      speak(msg);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, MATCHING_STEPS.length * 700 + 400);

    return () => { clearInterval(interval); clearTimeout(showDriver); };
  }, []);

  const spinInterpolate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{phase === 0 ? 'Finding Your Driver' : 'Driver Found! 🎉'}</Text>
        </View>

        {/* AI bubble */}
        {phase === 1 && <AIBubble message={aiMsg} visible />}

        {/* Matching animation */}
        {phase === 0 && (
          <View style={styles.matchingSection}>
            <Animated.View style={[styles.spinRing, { transform: [{ rotate: spinInterpolate }] }]} />
            <View style={styles.spinCenter}>
              <Text style={styles.spinEmoji}>{vehicle?.emoji || '🚗'}</Text>
            </View>
            <View style={styles.steps}>
              {MATCHING_STEPS.map((step, i) => (
                <View key={step} style={styles.stepRow}>
                  <View style={[styles.stepDot, i <= stepIdx && styles.stepDotActive]} />
                  <Text style={[styles.stepText, i <= stepIdx && styles.stepTextActive]}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Driver found */}
        {phase === 1 && (
          <Animated.View style={[styles.driverSection, { transform: [{ scale }] }]}>
            <DriverCard
              driver={MOCK_DRIVER}
              onCall={() => speak('Calling Rahul Sharma.')}
              onChat={() => speak('Opening chat with Rahul.')}
            />

            {/* AI confidence card */}
            <View style={styles.aiCard}>
              <Text style={styles.aiCardTitle}>🤖 Why Rahul?</Text>
              {[
                ['Proximity', '0.8 km away', COLORS.green],
                ['Rating', '4.92 / 5.0', COLORS.yellow],
                ['On-time probability', '97%', COLORS.accent],
                ['Route familiarity', 'High', COLORS.green],
              ].map(([k, v, c]) => (
                <View key={k} style={styles.aiRow}>
                  <Text style={styles.aiKey}>{k}</Text>
                  <Text style={[styles.aiVal, { color: c }]}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Route info */}
            <View style={styles.routeCard}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.routeText} numberOfLines={1}>{pickup}</Text>
              </View>
              <View style={styles.routeLine2} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: COLORS.accent2 }]} />
                <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => {
                speak(AI_RESPONSES.rideConfirmed);
                navigation.navigate('Tracking', {
                  pickup,
                  destination,
                  vehicle,
                  driver: MOCK_DRIVER,
                });
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.acceptText}>Accept & Confirm Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.changeBtnText}>Change Vehicle</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  // Matching phase
  matchingSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spinRing: {
    position: 'absolute',
    width: 110, height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.border,
    borderTopColor: COLORS.accent,
  },
  spinCenter: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  spinEmoji: { fontSize: 36 },
  steps: { marginTop: 60, alignSelf: 'stretch', gap: SPACING.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  stepDotActive: { backgroundColor: COLORS.accent },
  stepText: { fontSize: 13, color: COLORS.muted },
  stepTextActive: { color: COLORS.text },

  // Found phase
  driverSection: { gap: SPACING.md },
  aiCard: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  aiCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  aiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  aiKey: { fontSize: 13, color: COLORS.muted },
  aiVal: { fontSize: 13, fontWeight: '600' },
  routeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { flex: 1, fontSize: 13, color: COLORS.text },
  routeLine2: { width: 2, height: 14, backgroundColor: COLORS.border, marginLeft: 4 },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  acceptText: { fontSize: 16, fontWeight: '700', color: 'white' },
  changeBtn: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  changeBtnText: { fontSize: 14, color: COLORS.muted },
});

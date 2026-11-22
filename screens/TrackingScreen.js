// screens/TrackingScreen.js — Live ride tracking + voice updates
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapPreview from '../components/MapPreview';
import DriverCard from '../components/DriverCard';
import AIBubble from '../components/AIBubble';
import { speak } from '../services/voiceAI';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const STATUS_PHASES = [
  { label: 'Driver en route to you', emoji: '🚗', color: COLORS.accent },
  { label: 'Driver arrived nearby', emoji: '📍', color: COLORS.yellow },
  { label: 'Ride in progress', emoji: '🛣️', color: COLORS.green },
  { label: 'Approaching destination', emoji: '🏁', color: COLORS.green },
  { label: 'Arrived! Rate your ride', emoji: '⭐', color: COLORS.yellow },
];

export default function TrackingScreen({ navigation, route }) {
  const { pickup, destination, vehicle, driver } = route.params;
  const [etaSecs, setEtaSecs] = useState(240);
  const [phase, setPhase] = useState(0);
  const [aiMsg, setAiMsg] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaSecs((s) => {
        if (s <= 0) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Phase progression
  useEffect(() => {
    const timeouts = [
      setTimeout(() => advancePhase(1, 'Your driver Rahul has arrived nearby. Please come to the pickup point.'), 15000),
      setTimeout(() => advancePhase(2, 'Ride started. Estimated 18 minutes to your destination.'), 30000),
      setTimeout(() => advancePhase(3, 'Approaching your destination. Please gather your belongings.'), 50000),
      setTimeout(() => advancePhase(4, 'You have arrived! Please rate your experience with Rahul.'), 65000),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  function advancePhase(p, msg) {
    setPhase(p);
    setAiMsg(msg);
    setShowBubble(true);
    speak(msg);
    if (p === 4) {
      setTimeout(() => setShowRating(true), 1500);
    }
    Animated.timing(progressAnim, {
      toValue: p / (STATUS_PHASES.length - 1),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }

  function formatEta(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (s === 0) return 'Arrived!';
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function handleCancel() {
    Alert.alert(
      'Cancel Ride?',
      'Are you sure you want to cancel?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            speak('Your ride has been cancelled. No charges applied.');
            navigation.popToTop();
          },
        },
      ]
    );
  }

  if (showRating) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>⭐ Rate Your Ride</Text>
          <Text style={styles.ratingSubtitle}>How was your experience with {driver?.name || 'Rahul'}?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                speak(`Thank you! You rated Rahul ${rating} stars. Have a great day!`);
                navigation.popToTop();
              }}
            >
              <Text style={styles.submitText}>Submit Rating</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Tracking</Text>
          <View style={styles.etaBadge}>
            <Text style={styles.etaValue}>{formatEta(etaSecs)}</Text>
            <Text style={styles.etaLabel}>ETA</Text>
          </View>
        </View>

        {/* Status bar */}
        <View style={styles.statusCard}>
          <Text style={styles.statusEmoji}>{STATUS_PHASES[phase].emoji}</Text>
          <Text style={[styles.statusText, { color: STATUS_PHASES[phase].color }]}>
            {STATUS_PHASES[phase].label}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1], outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {STATUS_PHASES.map((p, i) => (
            <View
              key={p.label}
              style={[
                styles.progressDot,
                { left: `${(i / (STATUS_PHASES.length - 1)) * 100}%` },
                i <= phase && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* AI message */}
        {showBubble && <AIBubble message={aiMsg} visible />}

        {/* Map */}
        <MapPreview pickup={pickup} dropoff={destination} showCar />

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Distance', value: '4.2 km', icon: 'navigate-outline' },
            { label: 'Est. Time', value: '18 min', icon: 'time-outline' },
            { label: 'Fare', value: vehicle?.price || '$8.50', icon: 'card-outline' },
          ].map(({ label, value, icon }) => (
            <View key={label} style={styles.statBox}>
              <Ionicons name={icon} size={18} color={COLORS.accent} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Driver */}
        <DriverCard
          driver={driver || { name: 'Rahul Sharma', emoji: '👨', rating: '4.92', trips: '1,284', plate: 'KA-05-MN-3421', car: 'Silver Honda City' }}
          onCall={() => speak('Calling your driver.')}
          onChat={() => speak('Opening chat with your driver.')}
        />

        {/* Share + Safety */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => speak('Trip shared with your emergency contacts.')}>
            <Ionicons name="share-social-outline" size={18} color={COLORS.accent} />
            <Text style={styles.actionText}>Share Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.accent2 }]} onPress={() => speak('SOS activated. Alerting emergency contacts and Ride AI safety team.')}>
            <Ionicons name="warning-outline" size={18} color={COLORS.accent2} />
            <Text style={[styles.actionText, { color: COLORS.accent2 }]}>SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel Ride</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2, gap: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  etaBadge: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  etaValue: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  etaLabel: { fontSize: 10, color: COLORS.muted },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusEmoji: { fontSize: 22 },
  statusText: { fontSize: 15, fontWeight: '600' },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginVertical: SPACING.xs,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    top: -3,
    marginLeft: -5,
  },
  progressDotActive: { backgroundColor: COLORS.accent },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: COLORS.accent },
  cancelBtn: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  cancelText: { fontSize: 14, color: COLORS.red, fontWeight: '600' },

  // Rating screen
  ratingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  ratingTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  ratingSubtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginBottom: SPACING.xl },
  starsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  star: { fontSize: 48, color: COLORS.border },
  starActive: { color: COLORS.yellow },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: 'white' },
});

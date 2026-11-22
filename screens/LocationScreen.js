// screens/LocationScreen.js — Pickup & drop-off input
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapPreview from '../components/MapPreview';
import AIBubble from '../components/AIBubble';
import { speak } from '../services/voiceAI';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const SUGGESTIONS = [
  { label: 'International Airport Terminal 2', emoji: '✈️' },
  { label: 'Central Mall, MG Road', emoji: '🛍️' },
  { label: 'City Hospital, Park Street', emoji: '🏥' },
  { label: 'Tech Park, Electronic City', emoji: '💼' },
  { label: 'Railway Station, Platform 1', emoji: '🚂' },
  { label: 'Downtown City Center', emoji: '🏙️' },
];

export default function LocationScreen({ navigation, route }) {
  const pickup = route?.params?.pickup || '123 Main Street, Downtown';
  const [dropoff, setDropoff] = useState(route?.params?.destination || '');
  const [aiMsg] = useState('Where would you like to go? Type or tap a suggestion.');

  function onSuggestionPress(label) {
    setDropoff(label);
    speak(`Destination set to ${label}`);
  }

  function onContinue() {
    if (!dropoff.trim()) return;
    navigation.navigate('Vehicle', { pickup, destination: dropoff });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Set Your Route</Text>
        </View>

        <AIBubble message={aiMsg} visible />

        {/* Inputs */}
        <View style={styles.inputsCard}>
          {/* Pickup */}
          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: COLORS.green }]} />
            <TextInput
              style={styles.input}
              value={pickup}
              editable={false}
              placeholderTextColor={COLORS.muted}
              placeholder="Pickup location"
            />
          </View>

          <View style={styles.divider} />

          {/* Drop-off */}
          <View style={styles.inputRow}>
            <View style={[styles.inputDot, { backgroundColor: COLORS.accent2 }]} />
            <TextInput
              style={[styles.input, { color: COLORS.text }]}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="Where to?"
              placeholderTextColor={COLORS.muted}
              autoFocus={!route?.params?.destination}
              returnKeyType="done"
              onSubmitEditing={onContinue}
            />
            {dropoff.length > 0 && (
              <TouchableOpacity onPress={() => setDropoff('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Map preview */}
        <MapPreview pickup={pickup} dropoff={dropoff} showCar={!!dropoff} />

        {/* Suggestions */}
        <Text style={styles.sectionTitle}>Popular Destinations</Text>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={styles.suggestion}
            onPress={() => onSuggestionPress(s.label)}
          >
            <View style={styles.suggestionIcon}>
              <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
            </View>
            <Text style={styles.suggestionText}>{s.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, !dropoff.trim() && styles.ctaBtnDisabled]}
          onPress={onContinue}
          disabled={!dropoff.trim()}
        >
          <Text style={styles.ctaText}>Find Available Rides →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  inputsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  inputDot: { width: 12, height: 12, borderRadius: 6 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.muted,
    paddingVertical: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
    marginLeft: 20,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.muted, marginBottom: SPACING.sm },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestionText: { flex: 1, fontSize: 14, color: COLORS.text },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.bg,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  ctaBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  ctaBtnDisabled: { backgroundColor: COLORS.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: 'white' },
});

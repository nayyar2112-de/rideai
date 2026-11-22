// screens/VehicleScreen.js — Vehicle & fare selection
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapPreview from '../components/MapPreview';
import AIBubble from '../components/AIBubble';
import { speak, AI_RESPONSES } from '../services/voiceAI';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const VEHICLES = [
  {
    id: 1,
    emoji: '🚗',
    name: 'RideGo',
    desc: 'Up to 4 passengers',
    price: '$8.50',
    priceNum: 8.5,
    eta: '3 min',
    tags: ['Economy', 'Quick'],
  },
  {
    id: 2,
    emoji: '🚙',
    name: 'Comfort',
    desc: 'Premium sedan',
    price: '$12.00',
    priceNum: 12.0,
    eta: '5 min',
    tags: ['Premium', 'AC'],
  },
  {
    id: 3,
    emoji: '🚐',
    name: 'SUV XL',
    desc: 'Up to 6, luggage space',
    price: '$18.50',
    priceNum: 18.5,
    eta: '7 min',
    tags: ['Spacious', 'Luggage'],
  },
];

export default function VehicleScreen({ navigation, route }) {
  const { pickup, destination } = route.params;
  const [selected, setSelected] = useState(VEHICLES[0]);
  const aiMsg = AI_RESPONSES.vehicleSelected(selected.name, selected.price, selected.eta);

  function handleSelect(v) {
    setSelected(v);
    speak(AI_RESPONSES.vehicleSelected(v.name, v.price, v.eta));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Ride</Text>
        </View>

        <AIBubble message={`I recommend ${selected.name} — ${selected.eta}, ${selected.price}. Shall I confirm?`} visible />

        {/* Map */}
        <MapPreview pickup={pickup} dropoff={destination} showCar />

        {/* Vehicle cards */}
        {VEHICLES.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[styles.vehicleCard, selected.id === v.id && styles.vehicleSelected]}
            onPress={() => handleSelect(v)}
            activeOpacity={0.8}
          >
            <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleNameRow}>
                <Text style={styles.vehicleName}>{v.name}</Text>
                {v.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.vehicleDesc}>{v.desc}</Text>
              <Text style={styles.vehicleEta}>🕐 {v.eta} away</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.price}>{v.price}</Text>
              {selected.id === v.id && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} style={{ marginTop: 6 }} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Fare breakdown */}
        <View style={styles.fareCard}>
          <Text style={styles.fareTitle}>💰 Fare Breakdown</Text>
          {[
            ['Base fare', '$4.00'],
            ['Distance (4.2 km)', `$${(selected.priceNum - 4 - 0.5).toFixed(2)}`],
            ['AI demand pricing', '$0.50'],
          ].map(([label, val]) => (
            <View key={label} style={styles.fareRow}>
              <Text style={styles.fareLabel}>{label}</Text>
              <Text style={styles.fareVal}>{val}</Text>
            </View>
          ))}
          <View style={[styles.fareRow, styles.fareTotal]}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalVal}>{selected.price}</Text>
          </View>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => {
            speak(AI_RESPONSES.matchingDriver);
            navigation.navigate('Matching', { pickup, destination, vehicle: selected });
          }}
        >
          <Text style={styles.ctaText}>Confirm {selected.name}  •  {selected.price}  →</Text>
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
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  vehicleSelected: { borderColor: COLORS.accent, backgroundColor: 'rgba(108,99,255,0.1)' },
  vehicleEmoji: { fontSize: 36 },
  vehicleInfo: { flex: 1 },
  vehicleNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap' },
  vehicleName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  tag: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: COLORS.muted },
  vehicleDesc: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  vehicleEta: { fontSize: 12, color: COLORS.green, marginTop: 3 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  fareCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  fareTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderColor: COLORS.border },
  fareLabel: { fontSize: 13, color: COLORS.muted },
  fareVal: { fontSize: 13, color: COLORS.text },
  fareTotal: { borderBottomWidth: 0, paddingTop: SPACING.sm },
  fareTotalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  fareTotalVal: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
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
  ctaText: { fontSize: 15, fontWeight: '700', color: 'white' },
});

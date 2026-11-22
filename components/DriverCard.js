// components/DriverCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function DriverCard({ driver, onCall, onChat }) {
  if (!driver) return null;
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{driver.emoji || '👨'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.rating}>⭐ {driver.rating} · {driver.trips} trips</Text>
        <Text style={styles.plate}>🚗 {driver.plate} · {driver.car}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCall}>
          <Ionicons name="call-outline" size={18} color={COLORS.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { marginTop: SPACING.xs }]} onPress={onChat}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  avatarEmoji: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  rating: { fontSize: 13, color: COLORS.yellow, marginTop: 2 },
  plate: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  actions: { alignItems: 'center' },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

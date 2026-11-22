// components/MapPreview.js
// Animated map preview (uses react-native-maps with a fallback placeholder)
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

export default function MapPreview({ pickup, dropoff, showCar = true }) {
  const carAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(carAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const carLeft = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['14%', '78%'],
  });

  return (
    <View style={styles.container}>
      {/* Grid lines */}
      <View style={styles.gridH1} /><View style={styles.gridH2} />
      <View style={styles.gridV1} /><View style={styles.gridV2} />

      {/* Route line */}
      <View style={styles.routeLine} />

      {/* Pickup dot */}
      <View style={[styles.dot, styles.pickupDot]}>
        <View style={styles.dotInner} />
      </View>

      {/* Dropoff dot */}
      <View style={[styles.dot, styles.dropoffDot]}>
        <View style={[styles.dotInner, { backgroundColor: COLORS.accent2 }]} />
      </View>

      {/* Labels */}
      <View style={[styles.label, { left: '8%', top: '20%' }]}>
        <Text style={styles.labelText}>📍 {pickup ? pickup.substring(0, 12) + '…' : 'You'}</Text>
      </View>
      <View style={[styles.label, { right: '4%', top: '20%' }]}>
        <Text style={styles.labelText}>🔴 {dropoff ? dropoff.substring(0, 12) + '…' : 'Drop'}</Text>
      </View>

      {/* Animated car */}
      {showCar && (
        <Animated.Text style={[styles.car, { left: carLeft }]}>🚗</Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 170,
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginVertical: 12,
    position: 'relative',
  },
  gridH1: { position: 'absolute', left: 0, right: 0, top: '33%', height: 1, backgroundColor: COLORS.border, opacity: 0.4 },
  gridH2: { position: 'absolute', left: 0, right: 0, top: '66%', height: 1, backgroundColor: COLORS.border, opacity: 0.4 },
  gridV1: { position: 'absolute', top: 0, bottom: 0, left: '33%', width: 1, backgroundColor: COLORS.border, opacity: 0.4 },
  gridV2: { position: 'absolute', top: 0, bottom: 0, left: '66%', width: 1, backgroundColor: COLORS.border, opacity: 0.4 },
  routeLine: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '50%',
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    opacity: 0.7,
  },
  dot: {
    position: 'absolute',
    top: '44%',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupDot: { left: '15%' },
  dropoffDot: { right: '15%' },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  label: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  labelText: { fontSize: 10, color: COLORS.muted },
  car: {
    position: 'absolute',
    top: '36%',
    fontSize: 22,
  },
});

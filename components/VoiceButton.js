// components/VoiceButton.js
// Animated mic button with listening pulse effect
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function VoiceButton({ listening, onPress, size = 72 }) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (listening) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1.5, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1.9, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ]),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse1.setValue(1);
      pulse2.setValue(1);
    }
  }, [listening]);

  const bgColor = listening ? COLORS.accent2 : COLORS.accent;

  return (
    <View style={[styles.wrapper, { width: size * 2.4, height: size * 2.4 }]}>
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: size * 0.9,
            backgroundColor: bgColor,
            opacity: 0.15,
            transform: [{ scale: pulse2 }],
          },
        ]}
      />
      {/* Inner pulse ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            backgroundColor: bgColor,
            opacity: 0.25,
            transform: [{ scale: pulse1 }],
          },
        ]}
      />
      {/* Main button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.btn,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Ionicons
          name={listening ? 'mic' : 'mic-outline'}
          size={size * 0.42}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});

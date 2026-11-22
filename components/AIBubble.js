// components/AIBubble.js
// Chat-style AI response bubble with typing animation
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function AIBubble({ message, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const [displayText, setDisplayText] = useState('');
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (visible && message) {
      // Slide in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Typewriter effect
      setDisplayText('');
      let i = 0;
      const timer = setInterval(() => {
        if (i < message.length) {
          setDisplayText(message.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 18);
      return () => clearInterval(timer);
    } else {
      opacity.setValue(0);
      translateY.setValue(10);
      setDisplayText('');
    }
  }, [message, visible]);

  // Blinking dots when typing
  useEffect(() => {
    const interval = setInterval(() => setDotCount(d => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>🤖</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {displayText || '.'.repeat(dotCount)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { fontSize: 18 },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 4,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
});

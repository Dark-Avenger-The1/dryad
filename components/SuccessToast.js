import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constant/constant';

const listeners = new Set();

// Can be called after a successful action from any screen or hook.
export function showSuccessToast(message) {
  listeners.forEach((listener) => listener(message));
}

export default function SuccessToastHost() {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState([]);
  const nextIdRef = useRef(0);
  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const show = (nextMessage) => {
      const id = ++nextIdRef.current;
      setToasts((current) => [...current, { id, message: nextMessage }]);
    };

    listeners.add(show);
    return () => listeners.delete(show);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.position, { top: insets.top + 12 }]}
    >
      {toasts.map((toast) => (
        <SuccessToast
          key={toast.id}
          message={toast.message}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </View>
  );
}

function SuccessToast({ message, onDismiss }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);
  const dismissRef = useRef(onDismiss);
  const dismissedRef = useRef(false);

  dismissRef.current = onDismiss;

  const dismissOnce = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    dismissRef.current();
  }, []);

  const resetPosition = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
        const horizontal = Math.abs(gesture.dx) > 8;
        const upward = gesture.dy < -8;

        return horizontal || upward;
        },
        onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
        translateY.setValue(Math.min(gesture.dy, 0));
        },
        onPanResponderRelease: (_, gesture) => {
          const dismissHorizontally = Math.abs(gesture.dx) > 60;
          const dismissUpward = gesture.dy < -50;

          if (!dismissHorizontally && !dismissUpward) {
            resetPosition();
            return;
          }

          clearTimeout(timeoutRef.current);
          animationRef.current?.stop();

          const exitX = dismissHorizontally
            ? Math.sign(gesture.dx) * 400
            : 0;
          const exitY = dismissUpward ? -140 : 0;

          animationRef.current = Animated.parallel([
            Animated.timing(translateX, {
              toValue: exitX,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: exitY,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]);
          animationRef.current.start(({ finished }) => {
            if (finished) dismissOnce();
          });
        },
        onPanResponderTerminate: resetPosition,
      }),
    [dismissOnce, opacity, resetPosition, translateX, translateY]
  );

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      animationRef.current = Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      });
      animationRef.current.start(({ finished }) => {
        if (finished) dismissOnce();
      });
    }, 5000);

    return () => {
      clearTimeout(timeoutRef.current);
      animationRef.current?.stop();
    };
  }, [dismissOnce, opacity]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityHint="Swipe up, left, or right to dismiss"
    >
      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  position: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 10,
    zIndex: 1000,
    elevation: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 420,
    minHeight: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  message: {
    color: '#FFFFFF',
    fontFamily: FONTS.body,
    fontSize: 16,
    flexShrink: 1,
  },
});

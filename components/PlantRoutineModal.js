import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constant/constant';

export default function PlantRoutineModal({
  visible,
  plant,
  instruction,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="leaf-outline"
              size={42}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.plantName}>
            {plant?.name}
          </Text>

          <Text style={styles.heading}>
            Today's Instructions
          </Text>

          <Text style={styles.instruction}>
            {instruction}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.imagePlaceholder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  plantName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  heading: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  instruction: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.xl,
  },

  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },

  closeText: {
    fontFamily: FONTS.quicksandBold,
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
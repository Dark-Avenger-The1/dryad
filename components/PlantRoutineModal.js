import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constant/constant';

// Icon for each task type from logic/DailyTask.js.
const TASK_ICONS = {
  water: 'water-outline',
  shade: 'sunny-outline',
  protect: 'snow-outline',
  mist: 'cloud-outline',
  airflow: 'swap-horizontal-outline',
  feed: 'nutrition-outline',
  info: 'information-circle-outline',
};

/**
 * plant: one item from getDailyRoutine() in database/queries/Read.js
 *   { gardenPlantId, commonName, imageUri, tasks: [{ type, text, priority? }], ... }
 */
export default function PlantRoutineModal({
  visible,
  plant,
  onClose,
}) {
  const tasks = plant?.tasks ?? [];

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
            {plant?.imageUri ? (
              <Image
                source={{ uri: plant.imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="leaf-outline"
                size={42}
                color={COLORS.primary}
              />
            )}
          </View>

          <Text style={styles.plantName}>
            {plant?.commonName}
          </Text>

          <Text style={styles.heading}>
            Today's Instructions
          </Text>

          {tasks.length === 0 ? (
            <Text style={styles.instruction}>
              No care information for this plant yet.
            </Text>
          ) : (
            <ScrollView
              style={styles.taskList}
              contentContainerStyle={styles.taskListContent}
            >
              {tasks.map((task, index) => (
                <View key={`${task.type}-${index}`} style={styles.taskRow}>
                  <Ionicons
                    name={TASK_ICONS[task.type] ?? TASK_ICONS.info}
                    size={20}
                    color={
                      task.priority === 'high'
                        ? COLORS.cta
                        : COLORS.primary
                    }
                  />
                  <Text
                    style={[
                      styles.taskText,
                      task.priority === 'high' && styles.taskTextHigh,
                    ]}
                  >
                    {task.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

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

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
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

  // Scrolls only if a plant has many tasks
  taskList: {
    alignSelf: 'stretch',
    maxHeight: 260,
    marginBottom: SPACING.xl,
  },

  taskListContent: {
    gap: SPACING.sm,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },

  taskText: {
    flex: 1,
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 20,
  },

  taskTextHigh: {
    fontFamily: FONTS.quicksandBold,
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
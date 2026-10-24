import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, FONTS, RADIUS, SIZES, SPACING } from "../constant/constant";
import { TASK_ICONS } from "../constant/taskIcons";

/**
 * task: one item from getTodayTasks() in database/queries/Read.js
 *   { key, gardenPlantId, commonName, imageUri, type, text, priority }
 *
 * onCheck(task) fires from the check circle. `checked` keeps the circle
 * filled while the parent asks for confirmation.
 */
export default function TodayTaskCard({ task, checked = false, onCheck }) {
  const isHigh = task.priority === "high";

  return (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {task.imageUri ? (
          <Image
            source={{ uri: task.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="leaf-outline" size={28} color={COLORS.primary} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.plantName} numberOfLines={1}>
          {task.commonName}
        </Text>

        <View style={styles.taskRow}>
          <Ionicons
            name={TASK_ICONS[task.type] ?? TASK_ICONS.info}
            size={16}
            color={isHigh ? COLORS.cta : COLORS.primary}
            style={styles.taskIcon}
          />
          <Text style={[styles.taskText, isHigh && styles.taskTextHigh]}>
            {task.text}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onCheck?.(task)}
        disabled={checked}
        hitSlop={10}
        style={({ pressed }) => [
          styles.checkCircle,
          checked && styles.checkCircleDone,
          pressed && styles.checkPressed,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={`Mark done: ${task.text}`}
      >
        {checked && (
          <Ionicons name="checkmark" size={18} color={COLORS.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,

    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  imageBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  info: {
    flex: 1,
    marginRight: SPACING.md,
  },

  plantName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.primary,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.xs,
  },

  taskIcon: {
    marginTop: 2,
    marginRight: 6,
  },

  taskText: {
    flex: 1,
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 20,
    color: COLORS.text,
  },

  taskTextHigh: {
    fontFamily: FONTS.quicksandBold,
  },

  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircleDone: {
    backgroundColor: COLORS.cta,
  },

  checkPressed: {
    opacity: 0.6,
  },
});

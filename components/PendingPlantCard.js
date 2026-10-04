import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS, SIZES, SPACING } from "../constant/constant";

/**
 * Shape of the `plant` prop:
 * {
 *   id: string,
 *   commonName: string,
 *   scientificName: string,
 *   image: { uri } | require(...),
 *   status: 'pending' | 'planted',
 *   care: {
 *     plantingSteps: [{ title, detail }],
 *     tips: string[],
 *     wateringDays: number,
 *   },
 * }
 *
 * onComplete(plant) fires when every step is checked and the user
 * taps the final button. The parent flips status to 'planted'.
 */

export default function PendingPlantCard({ plant, onComplete }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState([]);

  const steps = plant?.care?.plantingSteps ?? [];
  const allDone = steps.length > 0 && checked.length === steps.length;
  const progress = steps.length ? Math.round((checked.length / steps.length) * 100) : 0;

  const toggleStep = (index) => {
    setChecked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleComplete = () => {
    setVisible(false);
    onComplete?.(plant);
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Open planting steps for ${plant.commonName}`}
      >
        <View style={styles.imageBox}>
          <Image source={plant.image} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.divider} />

        <View style={styles.info}>
          <Text style={styles.commonName}>{plant.commonName}</Text>
          <Text style={styles.scientificName}>{plant.scientificName}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {checked.length}/{steps.length}
            </Text>
          </View>

          <Text style={styles.pendingLabel}>
            {allDone ? "Ready to confirm" : "Planting in progress"}
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />

          <View style={styles.detailCard}>
            <ScrollView
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
              bounces
              nestedScrollEnabled
            >
              <View style={styles.detailImageBox}>
                <Image source={plant.image} style={styles.image} resizeMode="cover" />
              </View>

              <Text style={styles.detailCommonName}>{plant.commonName}</Text>
              <Text style={styles.detailScientificName}>
                {plant.scientificName}
              </Text>

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Planting Steps</Text>
              <Text style={styles.sectionHint}>
                Tap each step as you finish it.
              </Text>

              {steps.map((step, i) => {
                const done = checked.includes(i);
                return (
                  <Pressable
                    key={i}
                    onPress={() => toggleStep(i)}
                    style={({ pressed }) => [
                      styles.stepRow,
                      done && styles.stepRowDone,
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                  >
                    <View style={[styles.checkbox, done && styles.checkboxDone]}>
                      <Text style={styles.checkMark}>{done ? "✓" : i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stepTitle, done && styles.stepTextDone]}>
                        {step.title}
                      </Text>
                      <Text style={[styles.stepDetail, done && styles.stepTextDone]}>
                        {step.detail}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              {plant?.care?.tips?.length > 0 && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionTitle}>Care Reminders</Text>
                  {plant.care.tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </>
              )}

              <Pressable
                onPress={handleComplete}
                disabled={!allDone}
                style={({ pressed }) => [
                  styles.confirmButton,
                  !allDone && styles.confirmDisabled,
                  pressed && allDone && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Finish planting"
              >
                <Text
                  style={[
                    styles.confirmText,
                    !allDone && styles.confirmTextDisabled,
                  ]}
                >
                  {allDone
                    ? "Finish — Move to My Garden"
                    : `${steps.length - checked.length} step${
                        steps.length - checked.length === 1 ? "" : "s"
                      } left`}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setVisible(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: -4, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  imageBox: {
    width: 96,
    height: 96,
    alignSelf: "center",
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.softdivider,
    marginHorizontal: SPACING.md,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  commonName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.primary,
  },
  scientificName: {
    fontFamily: FONTS.quicksand,
    fontStyle: "italic",
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.softdivider,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.cta,
  },
  progressText: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  pendingLabel: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.small,
    color: COLORS.cta,
    marginTop: 4,
  },

  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl - 2,
  },
  detailCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  detailContent: {
    padding: SPACING.xl,
  },
  detailImageBox: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  detailCommonName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.h2,
    color: COLORS.primary,
  },
  detailScientificName: {
    fontFamily: FONTS.quicksand,
    fontStyle: "italic",
    fontSize: SIZES.title,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.softdivider,
    marginTop: SPACING.xl - 2,
  },
  sectionTitle: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.h3,
    color: COLORS.primary,
    marginTop: SPACING.lg,
    marginBottom: 2,
  },
  sectionHint: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  stepRowDone: {
    backgroundColor: COLORS.imagePlaceholder,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  checkboxDone: {
    backgroundColor: COLORS.cta,
  },
  checkMark: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.small,
    color: COLORS.cta,
  },
  stepTitle: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  stepDetail: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 20,
    color: COLORS.text,
    marginTop: 2,
  },
  stepTextDone: {
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },

  tipRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  bullet: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    color: COLORS.cta,
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 20,
    color: COLORS.text,
  },

  confirmButton: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: COLORS.cta,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  confirmDisabled: {
    backgroundColor: COLORS.softdivider,
  },
  confirmText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },
  confirmTextDisabled: {
    color: COLORS.textMuted,
  },
  closeButton: {
    alignSelf: "stretch",
    alignItems: "center",
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  closeText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
  },
});
import React from "react";
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
 * Shape of the `result` prop (what identifyPlantScanner returns,
 * plus the image the user captured):
 * {
 *   image: { uri: string },
 *   candidates: [{ scientificName, commonName, family, score }],
 *   info: { commonName, slug, light, humidity, phLevel:{...}, temp:{...} },
 *   care: { tips: [], plantingSteps: [], wateringDays, light, humidity, soil, ph, temp },
 *   confidence: 'verified' | 'estimated' | 'generic',
 * }
 */

const RequirementRow = ({ label, value }) => (
  <View style={styles.reqRow}>
    <Text style={styles.reqLabel}>{label}</Text>
    <Text style={styles.reqValue}>{value}</Text>
  </View>
);

const ConfidenceBadge = ({ confidence }) => {
  const map = {
    verified: { text: "Verified data", color: COLORS.cta },
    estimated: { text: "Estimated from similar plants", color: "#C98A3A" },
    generic: { text: "Generic values — please review", color: COLORS.textMuted },
  };
  const item = map[confidence] ?? map.generic;
  return (
    <View style={[styles.badge, { borderColor: item.color }]}>
      <Text style={[styles.badgeText, { color: item.color }]}>{item.text}</Text>
    </View>
  );
};

export default function ScanResultModal({
  visible,
  result,
  onClose,
  onConfirm,
  onPickCandidate,
}) {
  if (!result) return null;

  const { image, candidates = [], care, confidence } = result;
  const top = candidates[0];
  const alternatives = candidates.slice(1);

  // Build the requirement strings from the care profile.
  const lightValue = care?.light
    ? `${care.light.band === "full" ? "Full sun" : care.light.band === "partial" ? "Partial sun" : "Shade"} (${care.light.hours} hrs)`
    : "Not available";

  const humidityValue = care?.humidity
    ? `${care.humidity.percent[0]}% - ${care.humidity.percent[1]}%`
    : "Not available";

  const phValue =
    care?.ph?.phMin != null || care?.ph?.phMax != null
      ? `${care.ph.phMin ?? "?"} - ${care.ph.phMax ?? "?"}`
      : "Not available";

  const tempValue =
    care?.temp?.minTemp != null || care?.temp?.maxTemp != null
      ? `${care.temp.minTemp ?? "?"}°C - ${care.temp.maxTemp ?? "?"}°C`
      : "Not available";

  const soilValue = care?.soil
    ? care.soil.level
    : "Not available";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.detailCard}>
          <ScrollView
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
            bounces
            nestedScrollEnabled
          >
            <View style={styles.detailImageBox}>
              {image?.uri ? (
                <Image source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />
              ) : null}
            </View>

            {/* --- identification --- */}
            <Text style={styles.detailCommonName}>
              {top?.commonName ?? "Unknown plant"}
            </Text>
            <Text style={styles.detailScientificName}>
              {top?.scientificName ?? "—"}
            </Text>

            <View style={styles.matchRow}>
              <Text style={styles.plantType}>{top?.family ?? ""}</Text>
              {top?.score != null && (
                <Text style={styles.scoreText}>{top.score}% match</Text>
              )}
            </View>

            <ConfidenceBadge confidence={confidence} />

            {/* --- other candidates --- */}
            {alternatives.length > 0 && (
              <>
                <Text style={styles.altTitle}>Not the right plant?</Text>
                {alternatives.map((c) => (
                  <Pressable
                    key={c.scientificName}
                    onPress={() => onPickCandidate?.(c)}
                    style={({ pressed }) => [
                      styles.altRow,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.altName}>
                        {c.commonName ?? c.scientificName}
                      </Text>
                      <Text style={styles.altSci}>{c.scientificName}</Text>
                    </View>
                    <Text style={styles.altScore}>{c.score}%</Text>
                  </Pressable>
                ))}
              </>
            )}

            {/* --- requirements --- */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Plant Requirements</Text>

            <RequirementRow label="Soil Nutrient Level:" value={soilValue} />
            <RequirementRow label="Light Level:" value={lightValue} />
            <RequirementRow label="pH Level:" value={phValue} />
            <RequirementRow label="Humidity:" value={humidityValue} />
            <RequirementRow label="Temperature:" value={tempValue} />
            <RequirementRow
              label="Watering:"
              value={`Every ${care?.wateringDays ?? 3} day${
                care?.wateringDays === 1 ? "" : "s"
              }`}
            />

            {/* --- care tips --- */}
            {care?.tips?.length > 0 && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Care Tips</Text>
                {care.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </>
            )}

            {/* --- planting steps preview --- */}
            {care?.plantingSteps?.length > 0 && (
              <>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Planting Steps</Text>
                {care.plantingSteps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDetail}>{step.detail}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* --- actions --- */}
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add this plant to my garden"
            >
              <Text style={styles.confirmText}>Add to My Garden</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  image: {
    width: "100%",
    height: "100%",
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
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  plantType: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.body,
    color: COLORS.cta,
  },
  scoreText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.cta,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: SPACING.sm,
  },
  badgeText: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.small,
  },

  altTitle: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  altRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.softdivider,
  },
  altName: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  altSci: {
    fontFamily: FONTS.quicksand,
    fontStyle: "italic",
    fontSize: SIZES.small,
    color: COLORS.textMuted,
  },
  altScore: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
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
    marginBottom: SPACING.md,
  },
  reqRow: {
    marginBottom: SPACING.md,
  },
  reqLabel: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: 2,
  },
  reqValue: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 20,
    color: COLORS.text,
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

  stepRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.cta,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.small,
    color: COLORS.white,
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

  confirmButton: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: COLORS.cta,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  confirmText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.white,
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
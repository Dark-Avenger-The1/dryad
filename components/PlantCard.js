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
 *   plantType: string,
 *   description: string,
 *   image: ImageSourcePropType,   // { uri } or require(...)
 *   requirements: {
 *     soilTypes: string[],
 *     lightLevel: string,
 *     phLevel: string,
 *     humidity: string,
 *     temperature: string,
 *   },
 * }
 */
 
// Static placeholder data. Replace by passing a `plant` prop.
export const SAMPLE_PLANT = {
  id: "1",
  commonName: "Snake Plant",
  scientificName: "Dracaena trifasciata",
  plantType: "Indoor Plant",
  description:
    "A hardy plant that is easy to maintain and can tolerate lower-light environments.",
  image: {
    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sansevieria_trifasciata_-_Snake_Plant.jpg/640px-Sansevieria_trifasciata_-_Snake_Plant.jpg",
  },
  requirements: {
    soilTypes: ["Well-draining soil", "Sandy soil"],
    lightLevel: "Low to Bright Indirect Light",
    phLevel: "5.5 - 7.5",
    humidity: "40% - 60%",
    temperature: "15°C - 30°C",
  },
};
 
const RequirementRow = ({ label, value }) => (
  <View style={styles.reqRow}>
    <Text style={styles.reqLabel}>{label}</Text>
    <Text style={styles.reqValue}>{value}</Text>
  </View>
);
 
export default function PlantCard({ plant = SAMPLE_PLANT }) {
  const [visible, setVisible] = useState(false);
  const { requirements } = plant;
 
  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${plant.commonName}`}
      >
        <View style={styles.imageBox}>
          <Image source={plant.image} style={styles.image} resizeMode="contain" />
        </View>
 
        <View style={styles.divider} />
 
        <View style={styles.info}>
          <Text style={styles.commonName}>{plant.commonName}</Text>
          <Text style={styles.scientificName}>{plant.scientificName}</Text>
          <Text style={styles.description} numberOfLines={4}>
            {plant.description}
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
                <Image source={plant.image} style={styles.image} resizeMode="contain" />
                </View>

                <Text style={styles.detailCommonName}>{plant.commonName}</Text>
                <Text style={styles.detailScientificName}>{plant.scientificName}</Text>
                <Text style={styles.plantType}>{plant.plantType}</Text>
                <Text style={styles.detailDescription}>{plant.description}</Text>

                <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Plant Requirements</Text>

                <View style={styles.reqRow}>
                <Text style={styles.reqLabel}>Compatible Soil Type:</Text>
                {requirements.soilTypes.map((soil) => (
                    <Text key={soil} style={styles.reqValue}>
                    • {soil}
                    </Text>
                ))}
                </View>
                <RequirementRow label="Light Level:" value={requirements.lightLevel} />
                <RequirementRow label="pH Level:" value={requirements.phLevel} />
                <RequirementRow label="Humidity:" value={requirements.humidity} />
                <RequirementRow label="Temperature:" value={requirements.temperature} />

                <Pressable
                onPress={() => setVisible(false)}
                style={({ pressed }) => [
                    styles.closeButton,
                    pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close plant details"
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
  description: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 19,
    color: COLORS.text,
    marginTop: SPACING.sm - 2,
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
    textAlign: "left",
  },
  detailScientificName: {
    fontFamily: FONTS.quicksand,
    fontStyle: "italic",
    fontSize: SIZES.title,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  plantType: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.body,
    color: COLORS.cta,
    marginTop: SPACING.sm,
  },
  detailDescription: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.title,
    lineHeight: 23,
    color: COLORS.text,
    marginTop: SPACING.sm + 2,
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
  closeButton: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: COLORS.cta,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  closeText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },
});
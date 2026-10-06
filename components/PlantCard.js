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

import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  FONTS,
  RADIUS,
  SIZES,
  SPACING,
} from "../constant/constant";

/**
 * Shape of the `plant` prop:
 * {
 *   id: string | number,
 *   commonName: string,
 *   scientificName: string,
 *   description: string | null,
 *   image: ImageSourcePropType | undefined,
 *   datePlanted: string,
 *   requirements: {
 *     soilNutrientLevel: string,
 *     lightLevel: string,
 *     phLevel: string,
 *     humidity: string,
 *     temperature: string,
 *   } | null,
 * }
 */

// Static placeholder data.
// Used only when no plant prop is provided.
export const SAMPLE_PLANT = {
  id: "1",
  commonName: "Snake Plant",
  scientificName: "Dracaena trifasciata",

  // Static for now.
  // Replace later with the actual planting date from the database.
  datePlanted: "Oct 7, 2026",

  description:
    "A hardy plant that is easy to maintain and can tolerate lower-light environments.",

  image: {
    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sansevieria_trifasciata_-_Snake_Plant.jpg/640px-Sansevieria_trifasciata_-_Snake_Plant.jpg",
  },

  requirements: {
    soilNutrientLevel: "Low",
    lightLevel: "Partial sun",
    phLevel: "5.5 - 7.5",
    humidity: "40% - 60%",
    temperature: "15°C - 30°C",
  },
};

// Reusable row for plant requirements.
const RequirementRow = ({ label, value }) => (
  <View style={styles.reqRow}>
    <Text style={styles.reqLabel}>{label}</Text>
    <Text style={styles.reqValue}>{value}</Text>
  </View>
);

export default function PlantCard({
  plant = SAMPLE_PLANT,
  layout = "list",
}) {
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { requirements } = plant;
  const isGridView = layout === "grid";

  // Uses database value later when available.
  const datePlanted = plant.datePlanted || "Oct 7, 2026";

  const closeModal = () => {
    setMenuVisible(false);
    setVisible(false);
  };

  // Placeholder only.
  // Connect to archive database logic later.
  const handleArchive = () => {
    setMenuVisible(false);
  };

  // Placeholder only.
  // Connect to delete/remove database logic later.
  const handleRemove = () => {
    setMenuVisible(false);
  };

  return (
    <>
      {/* Main Plant Card */}
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          isGridView ? styles.gridCard : styles.card,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${plant.commonName}`}
      >
        {isGridView ? (
          <>
            {/* Grid / Box Layout */}
            <View style={styles.gridImageBox}>
              {plant.image ? (
                <Image
                  source={plant.image}
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

            <View style={styles.gridInfo}>
              <Text style={styles.commonName} numberOfLines={1}>
                {plant.commonName}
              </Text>

              <Text style={styles.scientificName} numberOfLines={1}>
                {plant.scientificName}
              </Text>

              <Text style={styles.datePlanted} numberOfLines={1}>
                Planted: {datePlanted}
              </Text>

              {plant.description ? (
                <Text
                  style={styles.gridDescription}
                  numberOfLines={3}
                >
                  {plant.description}
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <>
            {/* List / Horizontal Layout */}
            <View style={styles.imageBox}>
              {plant.image ? (
                <Image
                  source={plant.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="leaf-outline"
                  size={38}
                  color={COLORS.primary}
                />
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.info}>
              <Text style={styles.commonName}>
                {plant.commonName}
              </Text>

              <Text style={styles.scientificName}>
                {plant.scientificName}
              </Text>

              <Text style={styles.datePlanted}>
                Planted: {datePlanted}
              </Text>

              {plant.description ? (
                <Text
                  style={styles.description}
                  numberOfLines={4}
                >
                  {plant.description}
                </Text>
              ) : null}
            </View>
          </>
        )}
      </Pressable>

      {/* Plant Details Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.backdrop}>
          {/* Tap outside to close */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
          />

          <View style={styles.detailCard}>
            {/* Three-dot plant options */}
            <View style={styles.menuContainer}>
              <Pressable
                onPress={() =>
                  setMenuVisible((previous) => !previous)
                }
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.menuButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Plant options"
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={24}
                  color={COLORS.text}
                />
              </Pressable>

              {/* Plant options dropdown */}
              {menuVisible && (
                <View style={styles.menuDropdown}>
                  <Pressable
                    onPress={handleArchive}
                    style={({ pressed }) => [
                      styles.menuOption,
                      pressed && styles.menuOptionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Move plant to archive"
                  >
                    <Ionicons
                      name="archive-outline"
                      size={18}
                      color={COLORS.text}
                    />

                    <Text style={styles.menuOptionText}>
                      Move to Plant Archive
                    </Text>
                  </Pressable>

                  <View style={styles.menuDivider} />

                  <Pressable
                    onPress={handleRemove}
                    style={({ pressed }) => [
                      styles.menuOption,
                      pressed && styles.menuOptionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Remove plant from garden"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={COLORS.text}
                    />

                    <Text style={styles.menuOptionText}>
                      Remove from Garden
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <ScrollView
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
              bounces
              nestedScrollEnabled
            >
              <View style={styles.detailImageBox}>
                {plant.image ? (
                  <Image
                    source={plant.image}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name="leaf-outline"
                    size={70}
                    color={COLORS.primary}
                  />
                )}
              </View>

              <Text style={styles.detailCommonName}>
                {plant.commonName}
              </Text>

              <Text style={styles.detailScientificName}>
                {plant.scientificName}
              </Text>

              {/* Static for now, database-ready later */}
              <View style={styles.datePlantedRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={COLORS.textMuted}
                />

                <Text style={styles.detailDatePlanted}>
                  Date Planted: {datePlanted}
                </Text>
              </View>

              {plant.description ? (
                <Text style={styles.detailDescription}>
                  {plant.description}
                </Text>
              ) : null}

              <View style={styles.sectionDivider} />

              <Text style={styles.sectionTitle}>
                Plant Requirements
              </Text>

              {requirements ? (
                <>
                  <RequirementRow
                    label="Soil Nutrient Level:"
                    value={requirements.soilNutrientLevel}
                  />

                  <RequirementRow
                    label="Light Level:"
                    value={requirements.lightLevel}
                  />

                  <RequirementRow
                    label="pH Level:"
                    value={requirements.phLevel}
                  />

                  <RequirementRow
                    label="Humidity:"
                    value={requirements.humidity}
                  />

                  <RequirementRow
                    label="Temperature:"
                    value={requirements.temperature}
                  />
                </>
              ) : (
                <Text style={styles.reqValue}>
                  No requirements recorded.
                </Text>
              )}

              <Pressable
                onPress={closeModal}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close plant details"
              >
                <Text style={styles.closeText}>
                  Close
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Horizontal list card
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: -4,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  // Box-style grid card
  gridCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [
      { translateY: 2 },
      { scale: 0.98 },
    ],
  },

  // List card image
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

  // Grid card image
  gridImageBox: {
    width: "100%",
    height: 140,
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

  gridInfo: {
    padding: SPACING.md,
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

  datePlanted: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  description: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    lineHeight: 19,
    color: COLORS.text,
    marginTop: SPACING.sm - 2,
  },

  gridDescription: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    lineHeight: 17,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },

  // Modal background
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl - 2,
  },

  // Modal card
  detailCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },

  detailContent: {
    padding: SPACING.xl,

    // Leaves room for the three-dot menu.
    paddingTop: SPACING.xl + SPACING.md,
  },

  // Three-dot menu
  menuContainer: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
    alignItems: "flex-end",
  },

  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  menuButtonPressed: {
    backgroundColor: COLORS.imagePlaceholder,
  },

  menuDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    minWidth: 210,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },

  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  menuOptionPressed: {
    opacity: 0.6,
  },

  menuOptionText: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.body,
    color: COLORS.text,
  },

  menuDivider: {
    height: 1,
    backgroundColor: COLORS.softdivider,
    marginHorizontal: SPACING.sm,
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

  datePlantedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.sm,
  },

  detailDatePlanted: {
    fontFamily: FONTS.quicksandMedium,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
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

  closeButtonPressed: {
    opacity: 0.7,
  },

  closeText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },
});
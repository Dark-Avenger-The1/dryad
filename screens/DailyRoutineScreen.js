import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import PlantRoutineModal from "../components/PlantRoutineModal";

import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
} from "../constant/constant";
import { useLiveQuery } from "../database/useLiveQuery";
import { getDailyRoutine } from "../database/queries/Read";

// Temporary weather data, in the shape services/weatherService.js returns.
// Replaced later with data from the weather API.
// Kept outside the component so useLiveQuery gets the same object on every
// render (a new object each render would re-run the query endlessly).
const TEMP_WEATHER = {
  temp: { now: 29, maxTemp: 31, minTemp: 24 },
  humidity: 78,
  rain: 8,   // mm today
  light: 2,  // hours of sunshine today
};

// Label and icon for the weather card. Uses the same limits as
// logic/DailyTask.js (more than 5 mm = rain, less than 3 h of sun = cloudy).
function describeWeather(weather) {
  if (weather.rain > 5) {
    return { label: "Rainy", icon: "rainy-outline" };
  }
  if (weather.light < 3) {
    return { label: "Cloudy", icon: "cloudy-outline" };
  }
  return { label: "Sunny", icon: "sunny-outline" };
}

export default function DailyRoutineScreen() {
  // Controls how plant cards are displayed.
  const [viewMode, setViewMode] = useState("grid");

  // Controls the selected plant and routine modal.
  // Only the id is stored, so the modal always shows the latest data.
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isGridView = viewMode === "grid";
  const isListView = viewMode === "list";

  const weather = TEMP_WEATHER;
  const weatherDisplay = describeWeather(weather);

  // Planted plants with today's tasks. Refreshes by itself when the garden changes.
  const { data, loading, error } = useLiveQuery(getDailyRoutine, weather);
  const plants = data ?? [];

  const selectedPlant =
    plants.find((plant) => plant.gardenPlantId === selectedPlantId) ?? null;

  const openPlantModal = (plant) => {
    setSelectedPlantId(plant.gardenPlantId);
    setModalVisible(true);
  };

  const closePlantModal = () => {
    setModalVisible(false);
  };

  // Displays today's date in the format "MMM DD, YYYY" (e.g., "Jun 15, 2024").
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      {/* Keeps content below the notch, status bar, or Dynamic Island. */}
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.screen}>
          <Text style={styles.title}>Daily Routine</Text>

          {/* Weather Information */}
          <View style={styles.weatherCard}>
            <Text style={styles.date}>{currentDate}</Text>

            <View style={styles.weatherInformation}>
              {/* Temperature */}
              <View style={styles.weatherItem}>
                <Ionicons
                  name="thermometer-outline"
                  size={22}
                  color={COLORS.primary}
                />

                <Text style={styles.weatherValue}>
                  {Math.round(weather.temp.now)}°
                </Text>

                <Text style={styles.weatherLabel}>
                  Temperature
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Humidity */}
              <View style={styles.weatherItem}>
                <Ionicons
                  name="water-outline"
                  size={22}
                  color={COLORS.primary}
                />

                <Text style={styles.weatherValue}>
                  {weather.humidity}%
                </Text>

                <Text style={styles.weatherLabel}>
                  Humidity
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Weather Condition */}
              <View style={styles.weatherItem}>
                <Ionicons
                  name={weatherDisplay.icon}
                  size={22}
                  color={COLORS.primary}
                />

                <Text style={styles.weatherValue}>
                  {weatherDisplay.label}
                </Text>

                <Text style={styles.weatherLabel}>
                  Weather
                </Text>
              </View>
            </View>
          </View>

          {/* Plant Routine Section */}
          <View style={styles.plantSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitle}>
                  My Plants
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Plants that need your attention today
                </Text>
              </View>

              {/* Grid / List Switcher */}
              <View style={styles.viewSwitcher}>
                <Pressable
                  onPress={() => setViewMode("grid")}
                  style={({ pressed }) => [
                    styles.viewButton,
                    isGridView && styles.activeViewButton,
                    pressed && styles.viewButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Grid view"
                >
                  <Ionicons
                    name="grid-outline"
                    size={18}
                    color={
                      isGridView
                        ? COLORS.white
                        : COLORS.primary
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={() => setViewMode("list")}
                  style={({ pressed }) => [
                    styles.viewButton,
                    isListView && styles.activeViewButton,
                    pressed && styles.viewButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="List view"
                >
                  <Ionicons
                    name="list-outline"
                    size={21}
                    color={
                      isListView
                        ? COLORS.white
                        : COLORS.primary
                    }
                  />
                </Pressable>
              </View>
            </View>

            {/*
              Only this area scrolls.
              The title, weather card, and plant container remain fixed.
            */}
            <ScrollView
              style={styles.plantScrollArea}
              contentContainerStyle={styles.plantScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {loading ? (
                <Text style={styles.stateText}>Loading plants...</Text>
              ) : error ? (
                <Text style={styles.stateText}>
                  Could not load plants: {error.message}
                </Text>
              ) : plants.length === 0 ? (
                <Text style={styles.stateText}>
                  No planted plants yet. Plant one from Home to see its routine here.
                </Text>
              ) : isGridView ? (
                <View style={styles.gridContainer}>
                  {plants.map((plant) => (
                    <Pressable
                      key={plant.gardenPlantId}
                      onPress={() => openPlantModal(plant)}
                      style={({ pressed }) => [
                        styles.gridCard,
                        pressed && styles.pressedCard,
                      ]}
                    >
                      <View style={styles.gridIconContainer}>
                        {plant.imageUri ? (
                          <Image
                            source={{ uri: plant.imageUri }}
                            style={styles.gridImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons
                            name="leaf-outline"
                            size={36}
                            color={COLORS.primary}
                          />
                        )}

                        {plant.needsAttention && (
                          <View style={styles.attentionDot} />
                        )}
                      </View>

                      <Text style={styles.gridPlantName}>
                        {plant.commonName}
                      </Text>

                      <Text style={styles.tapText}>
                        Tap for routine
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {plants.map((plant) => (
                    <Pressable
                      key={plant.gardenPlantId}
                      onPress={() => openPlantModal(plant)}
                      style={({ pressed }) => [
                        styles.listCard,
                        pressed && styles.pressedCard,
                      ]}
                    >
                      <View style={styles.listIconContainer}>
                        {plant.imageUri ? (
                          <Image
                            source={{ uri: plant.imageUri }}
                            style={styles.listImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons
                            name="leaf-outline"
                            size={30}
                            color={COLORS.primary}
                          />
                        )}

                        {plant.needsAttention && (
                          <View style={styles.attentionDot} />
                        )}
                      </View>

                      <View style={styles.listPlantInformation}>
                        <Text style={styles.listPlantName}>
                          {plant.commonName}
                        </Text>

                        <Text
                          style={styles.listInstructions}
                          numberOfLines={1}
                        >
                          {plant.tasks[0]?.text ??
                            "Tap to view today's instructions"}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward-outline"
                        size={22}
                        color={COLORS.textMuted}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>

      {/* Plant Routine Popup */}
      <PlantRoutineModal
        visible={modalVisible}
        plant={selectedPlant}
        onClose={closePlantModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Prevents content from overlapping the notch or Dynamic Island.
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Main screen
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  // Page title
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  // Weather Card
  weatherCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  date: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    textAlign: "right",
    marginBottom: SPACING.sm,
  },

  weatherInformation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weatherItem: {
    flex: 1,
    alignItems: "center",
  },

  weatherValue: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.text,
    marginTop: 2,
  },

  weatherLabel: {
    fontFamily: FONTS.quicksand,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: COLORS.softdivider,
  },

  // Plant Section
  plantSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  sectionTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h3,
    color: COLORS.primary,
  },

  sectionSubtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Scrollable area inside the plant section
  plantScrollArea: {
    flex: 1,
  },

  plantScrollContent: {
    paddingBottom: SPACING.md,
  },

  // Grid / List Switch
  viewSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
  },

  viewButton: {
    width: 37,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  activeViewButton: {
    backgroundColor: COLORS.primary,
  },

  viewButtonPressed: {
    opacity: 0.7,
  },

  // Grid Layout
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridCard: {
    width: "48%",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.softdivider,
  },

  gridIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },

  // Small dot on the photo when a plant has something to do today
  attentionDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.cta,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // Loading, error, and empty messages
  stateText: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.xl,
  },

  gridPlantName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.text,
    textAlign: "center",
  },

  tapText: {
    fontFamily: FONTS.quicksand,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // List Layout
  listContainer: {
    gap: SPACING.md,
  },

  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.softdivider,
  },

  listIconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },

  listImage: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.md,
  },

  listPlantInformation: {
    flex: 1,
  },

  listPlantName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.text,
  },

  listInstructions: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // Card press animation
  pressedCard: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
});
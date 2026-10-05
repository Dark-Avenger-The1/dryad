import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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

export default function DailyRoutineScreen() {
  // Controls how plant cards are displayed.
  const [viewMode, setViewMode] = useState("grid");

  // Controls the selected plant and routine modal.
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isGridView = viewMode === "grid";
  const isListView = viewMode === "list";

  // Temporary weather data.
  // Replaced later with data from the weather API.
  const weatherData = {
    temperature: 29,
    humidity: 78,
    weather: "Rainy",
    icon: "rainy-outline",
  };

  // Temporary plant data.
  // Replaced later with saved plants from the database/storage.
  const plants = [
    { id: 1, name: "Snake Plant" },
    { id: 2, name: "Aloe Vera" },
    { id: 3, name: "Peace Lily" },
    { id: 4, name: "Monstera" },
    { id: 5, name: "Spider Plant" },
    { id: 6, name: "ZZ Plant" },
    { id: 7, name: "Rubber Plant" },
    { id: 8, name: "Pothos" },
    { id: 9, name: "Calathea" },
    { id: 10, name: "Philodendron" },
    { id: 11, name: "Fern" },
    { id: 12, name: "Basil" },
  ];

  // Temporary rule-based instructions based on the current weather.
  const getPlantInstruction = (weather) => {
    if (weather === "Rainy") {
      return "Skip watering today. Keep the plant protected from too much rain and check if the soil is already wet.";
    }

    if (weather === "Sunny") {
      return "Check the soil for dryness. Water the plant if needed and avoid too much direct sunlight.";
    }

    if (weather === "Cloudy") {
      return "Follow the normal watering routine and place the plant somewhere it can still receive enough light.";
    }

    return "Check the plant condition and follow its normal care routine.";
  };

  const openPlantModal = (plant) => {
    setSelectedPlant(plant);
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
                  {weatherData.temperature}°
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
                  {weatherData.humidity}%
                </Text>

                <Text style={styles.weatherLabel}>
                  Humidity
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              {/* Weather Condition */}
              <View style={styles.weatherItem}>
                <Ionicons
                  name={weatherData.icon}
                  size={22}
                  color={COLORS.primary}
                />

                <Text style={styles.weatherValue}>
                  {weatherData.weather}
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
              {isGridView ? (
                <View style={styles.gridContainer}>
                  {plants.map((plant) => (
                    <Pressable
                      key={plant.id}
                      onPress={() => openPlantModal(plant)}
                      style={({ pressed }) => [
                        styles.gridCard,
                        pressed && styles.pressedCard,
                      ]}
                    >
                      <View style={styles.gridIconContainer}>
                        <Ionicons
                          name="leaf-outline"
                          size={36}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.gridPlantName}>
                        {plant.name}
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
                      key={plant.id}
                      onPress={() => openPlantModal(plant)}
                      style={({ pressed }) => [
                        styles.listCard,
                        pressed && styles.pressedCard,
                      ]}
                    >
                      <View style={styles.listIconContainer}>
                        <Ionicons
                          name="leaf-outline"
                          size={30}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.listPlantInformation}>
                        <Text style={styles.listPlantName}>
                          {plant.name}
                        </Text>

                        <Text style={styles.listInstructions}>
                          Tap to view today's instructions
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
        instruction={getPlantInstruction(weatherData.weather)}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
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
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
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
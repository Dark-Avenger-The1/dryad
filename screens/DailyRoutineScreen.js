import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import PlantRoutineModal from '../components/PlantRoutineModal';

import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constant/constant';

export default function DailyRoutineScreen() {
  // GRID or LIST
  const [viewMode, setViewMode] = useState('grid');

  // MODAL
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // TEMPORARY WEATHER DATA
  const weatherData = {
    temperature: 29,
    humidity: 78,
    weather: 'Rainy',
    icon: 'rainy-outline',
  };

  // TEMPORARY PLANT DATA
const plants = [
  { id: 1, name: 'Snake Plant' },
  { id: 2, name: 'Aloe Vera' },
  { id: 3, name: 'Peace Lily' },
  { id: 4, name: 'Monstera' },
  { id: 5, name: 'Spider Plant' },
  { id: 6, name: 'ZZ Plant' },
  { id: 7, name: 'Rubber Plant' },
  { id: 8, name: 'Pothos' },
  { id: 9, name: 'Calathea' },
  { id: 10, name: 'Philodendron' },
  { id: 11, name: 'Fern' },
  { id: 12, name: 'Basil' },
];

  // TEMPORARY WEATHER-BASED INSTRUCTIONS
  const getPlantInstruction = (weather) => {
    if (weather === 'Rainy') {
      return 'Skip watering today. Keep the plant protected from too much rain and check if the soil is already wet.';
    }

    if (weather === 'Sunny') {
      return 'Check the soil for dryness. Water the plant if needed and avoid too much direct sunlight.';
    }

    if (weather === 'Cloudy') {
      return 'Follow the normal watering routine and place the plant somewhere it can still receive enough light.';
    }

    return 'Check the plant condition and follow its normal care routine.';
  };

  // OPEN MODAL
  const openPlantModal = (plant) => {
    setSelectedPlant(plant);
    setModalVisible(true);
  };

  // CLOSE MODAL
  const closePlantModal = () => {
    setModalVisible(false);
  };

  // TODAY'S DATE
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* PAGE TITLE */}
        <Text style={styles.title}>Daily Routine</Text>

        {/* WEATHER CARD */}
        <View style={styles.weatherCard}>
          <Text style={styles.date}>{currentDate}</Text>

          <View style={styles.weatherInformation}>
            {/* TEMPERATURE */}
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

            {/* HUMIDITY */}
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

            {/* WEATHER */}
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

        {/* PLANT SECTION */}
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

          <View style={styles.viewSwitcher}>
            <Pressable
              style={({ pressed }) => [
                styles.viewButton,
                viewMode === 'grid' && styles.activeViewButton,
                pressed && styles.viewButtonPressed,
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={
                  viewMode === 'grid'
                    ? COLORS.white
                    : COLORS.primary
                }
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.viewButton,
                viewMode === 'list' && styles.activeViewButton,
                pressed && styles.viewButtonPressed,
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={21}
                color={
                  viewMode === 'list'
                    ? COLORS.white
                    : COLORS.primary
                }
              />
            </Pressable>
          </View>
        </View>
        <ScrollView
          style={styles.plantScrollArea}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {viewMode === 'grid' ? (
            <View style={styles.gridContainer}>
              {plants.map((plant) => (
                <Pressable
                  key={plant.id}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={() => openPlantModal(plant)}
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
                  style={({ pressed }) => [
                    styles.listCard,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={() => openPlantModal(plant)}
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
      </ScrollView>

      {/* PLANT ROUTINE POPUP */}
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
screen: {
  flex: 1,
  backgroundColor: COLORS.background,
},

container: {
  flex: 1,
  paddingHorizontal: SPACING.lg,
  paddingTop: SPACING.lg,
  paddingBottom: SPACING.md,
},

  /* TITLE */
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  /* WEATHER */
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
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },  

  weatherInformation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weatherItem: {
    flex: 1,
    alignItems: 'center',
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

  /* PLANT SECTION */
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  plantScrollArea: {
    flex: 1,
  },

  plantScrollContent: {
    paddingBottom: SPACING.md,
  },

  /* GRID / LIST SWITCHER */
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
  },

  viewButton: {
    width: 37,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeViewButton: {
    backgroundColor: COLORS.primary,
  },

  viewButtonPressed: {
    opacity: 0.7,
  },

  /* GRID */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.softdivider,
  },

  gridIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },

  gridPlantName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.text,
    textAlign: 'center',
  },

  tapText: {
    fontFamily: FONTS.quicksand,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  /* LIST */
  listContainer: {
    gap: SPACING.md,
  },

  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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

  /* PRESS EFFECT */

  pressedCard: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
});
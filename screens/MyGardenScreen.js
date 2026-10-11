import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import PlantCard from '../components/PlantCard';
import {
  COLORS,
  FONTS,
  SIZES,
  SPACING,
  RADIUS,
} from '../constant/constant';

import { useLiveQuery } from '../database/useLiveQuery';
import { getGardenPlantCards } from '../database/queries/Read';

// Requirement values as the text PlantCard shows
function formatRequirements(req) {
  if (!req) return null;

  return {
    soilNutrientLevel: req.soilNutrientLevel,
    lightLevel: req.lightLevel,
    phLevel: `${req.ph.min} - ${req.ph.max}`,
    humidity: `${req.humidity.level} (${req.humidity.min}% - ${req.humidity.max}%)`,
    temperature: `${req.temperatureC.min}°C - ${req.temperatureC.max}°C`,
  };
}

export default function MyGardenScreen() {
  // Controls how PlantCard components are displayed.
  const [layout, setLayout] = useState('list');

  const isListView = layout === 'list';
  const isGridView = layout === 'grid';

  // Planted plants from the database. Refreshes by itself when a plant is
  // planted, archived or restored.
  const { data, loading, error } = useLiveQuery(getGardenPlantCards);

  // Shape PlantCard expects
  const plants = useMemo(
    () =>
      (data ?? []).map((plant) => ({
        id: plant.gardenPlantId,
        commonName: plant.commonName,
        scientificName: plant.scientificName,
        description: plant.description,
        image: plant.imageUri ? { uri: plant.imageUri } : undefined,
        requirements: formatRequirements(plant.requirements),
      })),
    [data]
  );

  let message = null;

  if (loading) {
    message = 'Loading…';
  } else if (error) {
    message = `Could not load plants: ${error.message}`;
  } else if (plants.length === 0) {
    message =
      'No plants in your garden yet. Finish planting a plant on the Home screen to see it here.';
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Garden</Text>

          {/* List / Grid switcher */}
          <View style={styles.switchContainer}>
            <Pressable
              onPress={() => setLayout('list')}
              style={[
                styles.switchButton,
                isListView && styles.activeButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel="List view"
            >
              <Ionicons
                name="list"
                size={22}
                color={
                  isListView
                    ? COLORS.white
                    : COLORS.textMuted
                }
              />
            </Pressable>

            <Pressable
              onPress={() => setLayout('grid')}
              style={[
                styles.switchButton,
                isGridView && styles.activeButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Grid view"
            >
              <Ionicons
                name="grid-outline"
                size={21}
                color={
                  isGridView
                    ? COLORS.white
                    : COLORS.textMuted
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Fixed garden container */}
        <View style={styles.gardenContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              isGridView && styles.gridContainer,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {message ? (
              <Text style={styles.message}>{message}</Text>
            ) : (
              plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  layout={layout}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Keeps content below the notch / Dynamic Island.
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },

  // Header area
  header: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  // List / Grid switch
  switchContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 4,
  },

  switchButton: {
    width: 42,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },

  activeButton: {
    backgroundColor: COLORS.primary,
  },

  // Fixed container that holds the scrollable plants
  gardenContainer: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: SPACING.lg,
  },

  // Applied only when grid mode is selected
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  message: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl * 2,
  },
});
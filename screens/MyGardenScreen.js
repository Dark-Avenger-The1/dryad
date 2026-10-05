import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import PlantCard from '../components/PlantCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';

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
    message = 'No plants in your garden yet. Finish planting a plant on the Home screen to see it here.';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Garden</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : (
          plants.map((plant) => <PlantCard key={plant.id} plant={plant} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
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

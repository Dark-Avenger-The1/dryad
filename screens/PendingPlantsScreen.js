import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import PendingPlantCard from '../components/PendingPlantCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';

import { useLiveQuery } from '../database/useLiveQuery';
import { getPendingPlants } from '../database/queries/Read';
import { completePlanting, setPlantingStepChecked } from '../database/queries/Update';
import { showSuccessToast } from '../components/SuccessToast';

export default function PendingPlantsScreen() {
  const db = useSQLiteContext();

  // Refreshes by itself when a plant is scanned, planted or archived.
  const { data, loading, error } = useLiveQuery(getPendingPlants);

  // Shape PendingPlantCard expects
  const pending = useMemo(
    () =>
      (data ?? []).map((plant) => ({
        id: plant.gardenPlantId,
        gardenPlantId: plant.gardenPlantId,
        commonName: plant.commonName,
        scientificName: plant.scientificName,
        status: 'pending',
        image: plant.imageUri ? { uri: plant.imageUri } : undefined,
        checkedSteps: plant.checkedSteps,
        care: plant.care,
      })),
    [data]
  );

  // Saved right away; the list refreshes from the step-checked event.
  const handleToggleStep = async (plant, stepIndex, checked) => {
    try {
      await setPlantingStepChecked(db, plant.gardenPlantId, stepIndex, checked);
    } catch (e) {
      Alert.alert('Could not save step', e.message);
    }
  };

  // Pending -> planted. The plant leaves this list and appears in My Garden.
  const handleComplete = async (plant) => {
    try {
      await completePlanting(db, plant.gardenPlantId);
      showSuccessToast('Plant Added to Daily Routine!');
    } catch (e) {
      Alert.alert('Could not finish planting', e.message);
    }
  };

  let subtitle;
  if (loading) {
    subtitle = 'Loading…';
  } else if (error) {
    subtitle = `Could not load plants: ${error.message}`;
  } else if (pending.length > 0) {
    subtitle = `${pending.length} plant${pending.length === 1 ? '' : 's'} waiting to be planted`;
  } else {
    subtitle = 'Nothing pending';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading || error ? null : pending.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No plants waiting. Scan a plant to get started.
            </Text>
          </View>
        ) : (
          pending.map((plant) => (
            <PendingPlantCard
              key={plant.id}
              plant={plant}
              onToggleStep={handleToggleStep}
              onComplete={handleComplete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import ArchivedPlantCard from '../components/ArchivedPlantCard';
import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../constant/constant';
import { useLiveQuery } from '../database/useLiveQuery';
import { getArchivedPlants } from '../database/queries/Read';
import { usePlantActions } from '../hooks/usePlantActions';

export default function ArchiveScreen() {
  // Archived plants from the database. Refreshes by itself when a plant is
  // archived, restored or deleted.
  const { data, loading, error } = useLiveQuery(getArchivedPlants);
  const { restore, deleteArchived } = usePlantActions();

  const plants = data ?? [];

  let message = null;
  if (loading) {
    message = 'Loading…';
  } else if (error) {
    message = `Could not load archive: ${error.message}`;
  } else if (plants.length === 0) {
    message =
      'No archived plants. Plants you move to the archive from My Garden show up here.';
  }

  return (
    <View style={styles.container}>
      {plants.length > 0 ? (
        <Text style={styles.subtitle}>
          {`${plants.length} archived plant${plants.length === 1 ? '' : 's'}`}
        </Text>
      ) : null}

      <View style={styles.archiveContainer}>
        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : (
          <FlatList
            data={plants}
            keyExtractor={(plant) => String(plant.gardenPlantId)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ArchivedPlantCard
                plant={item}
                onRestore={restore}
                onDelete={deleteArchived}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },

  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  archiveContainer: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },

  listContent: {
    paddingBottom: SPACING.lg,
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

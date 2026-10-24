import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZES, SPACING, RADIUS } from '../constant/constant';
import { formatDate } from '../helper/FormatDate';

/**
 * Shape of the `plant` prop (a row from getArchivedPlants):
 * {
 *   gardenPlantId: number,
 *   commonName: string,
 *   scientificName: string,
 *   imageUri: string | null,
 *   plantedAt: string | null,   // UTC ISO, null if archived while pending
 *   archivedAt: string,         // UTC ISO
 * }
 *
 * onRestore(plant) and onDelete(plant) fire from the two buttons.
 * The card only displays; the parent decides what the buttons do.
 */
export default function ArchivedPlantCard({ plant, onRestore, onDelete }) {
  const planted = formatDate(plant.plantedAt);
  const archived = formatDate(plant.archivedAt);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.imageBox}>
          {plant.imageUri ? (
            <Image
              source={{ uri: plant.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="leaf-outline" size={32} color={COLORS.primary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.commonName} numberOfLines={1}>
            {plant.commonName}
          </Text>
          <Text style={styles.scientificName} numberOfLines={1}>
            {plant.scientificName}
          </Text>
          <Text style={styles.date}>
            {planted ? `Planted: ${planted}` : 'Not planted yet'}
          </Text>
          <Text style={styles.date}>Archived: {archived}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onRestore?.(plant)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.restoreButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Restore ${plant.commonName}`}
        >
          <Ionicons name="arrow-undo-outline" size={16} color={COLORS.white} />
          <Text style={styles.restoreText}>Restore</Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete?.(plant)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${plant.commonName} permanently`}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.cta} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.imagePlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  info: {
    flex: 1,
  },

  commonName: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.title,
    color: COLORS.primary,
  },

  scientificName: {
    fontFamily: FONTS.quicksand,
    fontStyle: 'italic',
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  date: {
    fontFamily: FONTS.quicksand,
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
  },

  restoreButton: {
    backgroundColor: COLORS.primary,
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: COLORS.cta,
    backgroundColor: COLORS.white,
  },

  pressed: {
    opacity: 0.7,
  },

  restoreText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },

  deleteText: {
    fontFamily: FONTS.quicksandBold,
    fontSize: SIZES.body,
    color: COLORS.cta,
  },
});

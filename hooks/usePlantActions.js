import { Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { archivePlant, deletePlantPermanently } from '../database/queries/Delete';
import { restorePlant } from '../database/queries/Update';
import { attempt } from '../helper/Alerts';
import { showSuccessToast } from '../components/SuccessToast';

/**
 * Archive / restore / delete actions for garden plants.
 * Every function takes a plant with { gardenPlantId, commonName }.
 * Screens refresh automatically through garden change events.
 */
export function usePlantActions() {
  const db = useSQLiteContext();

  // Soft delete: My Garden -> Archive
  const archive = (plant) => {
    Alert.alert(
      'Archive Plant?',
      `Move ${plant.commonName} to the archive? You can restore it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            await attempt('Could not archive plant', async () => {
              await archivePlant(db, plant.gardenPlantId);
              showSuccessToast('Plant Archived!');
            });
          },
        },
      ]
    );
  };

  // Archive -> previous location
  const restore = (plant) => {
    Alert.alert(
      'Restore Plant?',
      `Restore ${plant.commonName} to its previous location?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            await attempt('Could not restore plant', async () => {
              await restorePlant(db, plant.gardenPlantId);
              showSuccessToast('Plant Restored!');
            });
          },
        },
      ]
    );
  };

  // Permanently delete an archived plant
  const deleteArchived = (plant) => {
    Alert.alert(
      'Delete Permanently?',
      `${plant.commonName} and its photo will be deleted. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await attempt('Could not delete plant', async () => {
              await deletePlantPermanently(db, plant.gardenPlantId);
              showSuccessToast('Plant Deleted Permanently!');
            });
          },
        },
      ]
    );
  };

  // Permanently remove a plant from My Garden
  const removeFromGarden = (plant) => {
    Alert.alert(
      'Remove from Garden?',
      `${plant.commonName} and its photo will be deleted permanently. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await attempt('Could not remove plant', async () => {
              await archivePlant(db, plant.gardenPlantId);
              await deletePlantPermanently(db, plant.gardenPlantId);
              showSuccessToast('Plant Removed from Garden!');
            });
          },
        },
      ]
    );
  };

  return { archive, restore, deleteArchived, removeFromGarden };
}
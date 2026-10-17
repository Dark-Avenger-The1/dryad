import { useSQLiteContext } from 'expo-sqlite';

import { archivePlant, deletePlantPermanently } from '../database/queries/Delete';
import { restorePlant } from '../database/queries/Update';
import { attempt, confirmAction } from '../helper/Alerts';

const confirmDestructive = (title, message, confirmText) =>
  confirmAction(title, message, confirmText, { destructive: true });

/**
 * Archive / restore / delete actions for garden plants.
 * Every function takes a plant with { gardenPlantId, commonName }.
 * Screens refresh by themselves: the queries fire garden change events.
 */
export function usePlantActions() {
  const db = useSQLiteContext();

  // Soft delete: My Garden -> Archive
  const archive = (plant) =>
    attempt('Could not archive plant', () =>
      archivePlant(db, plant.gardenPlantId)
    );

  // Archive -> back to Home (pending) or My Garden (planted)
  const restore = (plant) =>
    attempt('Could not restore plant', () =>
      restorePlant(db, plant.gardenPlantId)
    );

  // Hard delete of an archived plant and its photo
  const deleteArchived = async (plant) => {
    const confirmed = await confirmDestructive(
      'Delete permanently?',
      `${plant.commonName} and its photo will be deleted. This cannot be undone.`,
      'Delete'
    );
    if (!confirmed) return;

    await attempt('Could not delete plant', () =>
      deletePlantPermanently(db, plant.gardenPlantId)
    );
  };

  // Hard delete straight from My Garden. deletePlantPermanently only removes
  // archived plants, so the plant is archived first.
  const removeFromGarden = async (plant) => {
    const confirmed = await confirmDestructive(
      'Remove from Garden?',
      `${plant.commonName} and its photo will be deleted permanently. This cannot be undone.`,
      'Remove'
    );
    if (!confirmed) return;

    await attempt('Could not remove plant', async () => {
      await archivePlant(db, plant.gardenPlantId);
      await deletePlantPermanently(db, plant.gardenPlantId);
    });
  };

  return { archive, restore, deleteArchived, removeFromGarden };
}

// Delete queries: archiving (soft delete) and permanent delete.
//
// Every function takes the database as its first argument, which a component
// gets with useSQLiteContext() from 'expo-sqlite'. Each returns true if a plant
// was changed, false if nothing matched.

import { notifyGardenChanged } from '../events';
import { deletePlantImage } from '../images';

// Soft delete: the plant moves to the Archive and disappears from Home,
// My Garden and Daily Routine. Nothing is erased, so restorePlant() in
// Update.js can bring it back exactly as it was.
export async function archivePlant(db, gardenPlantId) {
    const result = await db.runAsync(
        `UPDATE garden_plants
         SET archived_at = datetime('now')
         WHERE garden_plant_id = ?
           AND archived_at IS NULL`,
        gardenPlantId
    );

    const changed = result.changes > 0;
    if (changed) {
        notifyGardenChanged({ type: 'archived', gardenPlantId });
    }
    return changed;
}

// Erases an archived plant for good (e.g. "Delete forever" in the Archive),
// including its photo file. Only works on archived plants, so an active plant
// can't be erased by mistake. The species info in plants stays, ready for the
// next scan.
export async function deletePlantPermanently(db, gardenPlantId) {
    const deleted = await db.getFirstAsync(
        `DELETE FROM garden_plants
         WHERE garden_plant_id = ?
           AND archived_at IS NOT NULL
         RETURNING image_uri AS imageUri`,
        gardenPlantId
    );

    if (!deleted) {
        return false;
    }

    // Only after the row is gone, so a failed delete never loses the photo
    deletePlantImage(deleted.imageUri);
    notifyGardenChanged({ type: 'deleted', gardenPlantId });
    return true;
}

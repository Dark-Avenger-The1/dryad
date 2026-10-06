import { notifyGardenChanged } from '../events';
import { deletePlantImage } from '../images';

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

    deletePlantImage(deleted.imageUri);
    notifyGardenChanged({ type: 'deleted', gardenPlantId });
    return true;
}

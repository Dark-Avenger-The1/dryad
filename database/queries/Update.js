

import { notifyGardenChanged } from '../events';

export async function setPlantingStepChecked(db, gardenPlantId, stepIndex, checked) {
    const result = checked
        ? await db.runAsync(
              `INSERT OR IGNORE INTO planting_step_checks (garden_plant_id, step_index)
               SELECT garden_plant_id, ?
               FROM garden_plants
               WHERE garden_plant_id = ?
                 AND status = 'pending'
                 AND archived_at IS NULL`,
              stepIndex, gardenPlantId
          )
        : await db.runAsync(
              `DELETE FROM planting_step_checks
               WHERE garden_plant_id = ? AND step_index = ?`,
              gardenPlantId, stepIndex
          );

    const changed = result.changes > 0;
    if (changed) {
        notifyGardenChanged({ type: 'step-checked', gardenPlantId });
    }
    return changed;
}


export async function completePlanting(db, gardenPlantId) {
    let changed = false;

    await db.withTransactionAsync(async () => {
        const result = await db.runAsync(
            `UPDATE garden_plants
             SET status          = 'planted',
                 planted_at      = datetime('now'),
                 last_watered_at = datetime('now'),
                 last_fed_at     = datetime('now')
             WHERE garden_plant_id = ?
               AND status = 'pending'
               AND archived_at IS NULL`,
            gardenPlantId
        );
        changed = result.changes > 0;

        if (changed) {
            // Step ticks are only needed while pending
            await db.runAsync(
                'DELETE FROM planting_step_checks WHERE garden_plant_id = ?',
                gardenPlantId
            );
        }
    });

    if (changed) {
        notifyGardenChanged({ type: 'planted', gardenPlantId });
    }
    return changed;
}

// The user watered a planted plant today. Resets the watering countdown
// used by the Daily Routine.
export async function markWatered(db, gardenPlantId) {
    const result = await db.runAsync(
        `UPDATE garden_plants
         SET last_watered_at = datetime('now')
         WHERE garden_plant_id = ?
           AND status = 'planted'
           AND archived_at IS NULL`,
        gardenPlantId
    );

    const changed = result.changes > 0;
    if (changed) {
        notifyGardenChanged({ type: 'watered', gardenPlantId });
    }
    return changed;
}

// The user fed (fertilized) a planted plant today.
export async function markFed(db, gardenPlantId) {
    const result = await db.runAsync(
        `UPDATE garden_plants
         SET last_fed_at = datetime('now')
         WHERE garden_plant_id = ?
           AND status = 'planted'
           AND archived_at IS NULL`,
        gardenPlantId
    );

    const changed = result.changes > 0;
    if (changed) {
        notifyGardenChanged({ type: 'fed', gardenPlantId });
    }
    return changed;
}

export async function restorePlant(db, gardenPlantId) {
    const result = await db.runAsync(
        `UPDATE garden_plants
         SET archived_at = NULL
         WHERE garden_plant_id = ?
           AND archived_at IS NOT NULL`,
        gardenPlantId
    );

    const changed = result.changes > 0;
    if (changed) {
        notifyGardenChanged({ type: 'restored', gardenPlantId });
    }
    return changed;
}

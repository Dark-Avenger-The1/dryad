// Read queries: everything the screens display.
//
// Every function takes the database as its first argument. In a screen, use
// them through useLiveQuery so the screen refreshes when data changes:
//
//     import { useLiveQuery } from '../database/useLiveQuery';
//     import { getGardenPlantCards } from '../database/queries/Read';
//
//     const { data: plants = [], loading } = useLiveQuery(getGardenPlantCards);
//
// Column names are aliased to camelCase so results can be used directly in JSX.
// Only active plants (archived_at IS NULL) appear outside the Archive.

import buildTipsInterpreter from '../../logic/BuildPlantFieldInterpreter';
import { buildDailyTasks } from '../../logic/DailyTask';
import { toGrowthShape } from '../../helper/PlantDefaults';

// The stored scores, named like helper/PlantDefaults.js resolveGrowth().values
const GROWTH_COLUMNS = `
    r.light_score         AS light,
    r.humidity_score      AS atmosphericHumidity,
    r.soil_nutrient_score AS soilNutriments,
    r.soil_humidity_score AS soilHumidity,
    r.min_ph              AS phMin,
    r.max_ph              AS phMax,
    r.min_temp_c          AS minTempC,
    r.max_temp_c          AS maxTempC,
    r.days_to_harvest     AS daysToHarvest
`;

// Rebuilds the same `care` object the scanner shows (tips, plantingSteps,
// wateringDays, light/humidity/soil/ph/temp bands) from the stored scores,
// using the existing logic/ files. null if the plant has no requirements row.
function careFromRow(row) {
    if (row.light === null) {
        return null;
    }
    return buildTipsInterpreter(toGrowthShape({
        light: row.light,
        atmosphericHumidity: row.atmosphericHumidity,
        soilNutriments: row.soilNutriments,
        soilHumidity: row.soilHumidity,
        phMin: row.phMin,
        phMax: row.phMax,
        minTempC: row.minTempC,
        maxTempC: row.maxTempC,
        daysToHarvest: row.daysToHarvest,
    }));
}

// ---------- Home: plants waiting to be planted ----------

// Newest first.
// Returns: [{ gardenPlantId, commonName, scientificName, imageUri, createdAt,
//             checkedSteps: [0, 2],         // indexes of ticked care.plantingSteps
//             care }]                       // care.plantingSteps, care.tips, ...
export async function getPendingPlants(db) {
    const rows = await db.getAllAsync(`
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               strftime('%Y-%m-%dT%H:%M:%SZ', g.created_at) AS createdAt,
               (SELECT json_group_array(c.step_index ORDER BY c.step_index)
                FROM planting_step_checks c
                WHERE c.garden_plant_id = g.garden_plant_id) AS checkedStepsJson,
               ${GROWTH_COLUMNS}
        FROM garden_plants g
        JOIN plants p                  ON p.plant_id = g.plant_id
        LEFT JOIN plant_requirements r ON r.plant_id = g.plant_id
        WHERE g.status = 'pending'
          AND g.archived_at IS NULL
        ORDER BY g.created_at DESC, g.garden_plant_id DESC
    `);

    return rows.map((row) => ({
        gardenPlantId: row.gardenPlantId,
        commonName: row.commonName,
        scientificName: row.scientificName,
        imageUri: row.imageUri,
        createdAt: row.createdAt,
        checkedSteps: JSON.parse(row.checkedStepsJson),
        care: careFromRow(row),
    }));
}

// ---------- My Garden: cards ----------

// Planted plants, A-Z by common name. description is the full text; shorten
// it on the card with <Text numberOfLines={...}>.
// Returns: [{ gardenPlantId, commonName, scientificName, imageUri, description }]
export function getGardenPlantCards(db) {
    return db.getAllAsync(`
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               p.description
        FROM garden_plants g
        JOIN plants p ON p.plant_id = g.plant_id
        WHERE g.status = 'planted'
          AND g.archived_at IS NULL
        ORDER BY p.common_name COLLATE NOCASE, g.garden_plant_id
    `);
}

// ---------- My Garden / Archive: card pop-up ----------

// One garden plant with its requirements as display values, in one query.
// Works for archived plants too.
//
// Returns null if not found, otherwise:
// {
//     gardenPlantId, commonName, scientificName, imageUri, description,
//     status: 'pending' | 'planted', plantedAt, archivedAt,   // ISO UTC or null
//     dataConfidence: 'verified' | 'estimated' | 'generic',
//     requirements: {
//         soilNutrientLevel: 'Very low' | 'Low' | 'Medium' | 'High' | 'Very high',
//         lightLevel:        'Shade' | 'Partial sun' | 'Full sun',
//         ph:                { min: 6.0, max: 7.0 },
//         humidity:          { level: 'Moderate', min: 45, max: 70 },   // %
//         temperatureC:      { min: 15, max: 35 },
//     } | null
// }
export async function getPlantDetails(db, gardenPlantId) {
    const row = await db.getFirstAsync(
        `
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               p.description,
               g.status,
               strftime('%Y-%m-%dT%H:%M:%SZ', g.planted_at)  AS plantedAt,
               strftime('%Y-%m-%dT%H:%M:%SZ', g.archived_at) AS archivedAt,
               p.data_confidence AS dataConfidence,
               r.plant_id        AS requirementsPlantId,
               r.min_ph          AS minPh,
               r.max_ph          AS maxPh,
               r.min_temp_c      AS minTempC,
               r.max_temp_c      AS maxTempC,
               (SELECT name FROM soil_nutrient_levels
                WHERE max_score >= r.soil_nutrient_score
                ORDER BY max_score LIMIT 1) AS soilNutrientLevel,
               (SELECT name FROM light_levels
                WHERE max_score >= r.light_score
                ORDER BY max_score LIMIT 1) AS lightLevel,
               h.name            AS humidityLevel,
               h.min_percent     AS minHumidity,
               h.max_percent     AS maxHumidity
        FROM garden_plants g
        JOIN plants p                  ON p.plant_id = g.plant_id
        LEFT JOIN plant_requirements r ON r.plant_id = g.plant_id
        LEFT JOIN humidity_levels h    ON h.humidity_id = (
                 SELECT humidity_id FROM humidity_levels
                 WHERE max_score >= r.humidity_score
                 ORDER BY max_score LIMIT 1)
        WHERE g.garden_plant_id = ?
        `,
        gardenPlantId
    );

    if (!row) {
        return null;
    }

    return {
        gardenPlantId: row.gardenPlantId,
        commonName: row.commonName,
        scientificName: row.scientificName,
        imageUri: row.imageUri,
        description: row.description,
        status: row.status,
        plantedAt: row.plantedAt,
        archivedAt: row.archivedAt,
        dataConfidence: row.dataConfidence,
        requirements: row.requirementsPlantId === null ? null : {
            soilNutrientLevel: row.soilNutrientLevel,
            lightLevel: row.lightLevel,
            ph: { min: row.minPh, max: row.maxPh },
            humidity: { level: row.humidityLevel, min: row.minHumidity, max: row.maxHumidity },
            temperatureC: { min: row.minTempC, max: row.maxTempC },
        },
    };
}

// ---------- Daily Routine ----------

// Planted plants with what logic/DailyTask.js needs, A-Z by common name.
// Days are counted in the phone's local time; null = never.
// Returns: [{ gardenPlantId, commonName, scientificName, imageUri,
//             daysSinceWatered, daysSinceFed, care }]
export async function getDailyRoutinePlants(db) {
    const rows = await db.getAllAsync(`
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               CAST(julianday('now', 'localtime', 'start of day')
                    - julianday(g.last_watered_at, 'localtime', 'start of day')
                    AS INTEGER)  AS daysSinceWatered,
               CAST(julianday('now', 'localtime', 'start of day')
                    - julianday(g.last_fed_at, 'localtime', 'start of day')
                    AS INTEGER)  AS daysSinceFed,
               ${GROWTH_COLUMNS}
        FROM garden_plants g
        JOIN plants p                  ON p.plant_id = g.plant_id
        LEFT JOIN plant_requirements r ON r.plant_id = g.plant_id
        WHERE g.status = 'planted'
          AND g.archived_at IS NULL
        ORDER BY p.common_name COLLATE NOCASE, g.garden_plant_id
    `);

    return rows.map((row) => ({
        gardenPlantId: row.gardenPlantId,
        commonName: row.commonName,
        scientificName: row.scientificName,
        imageUri: row.imageUri,
        daysSinceWatered: row.daysSinceWatered,
        daysSinceFed: row.daysSinceFed,
        care: careFromRow(row),
    }));
}

// Today's instructions for every planted plant. `weather` is the object
// services/weatherService.js returns:
//     { temp: { now, maxTemp, minTemp }, humidity, rain, light }
// When the weather doesn't suit a plant (too hot, too cold, too dry, too
// humid, too little sun, rain), logic/DailyTask.js adds a matching task.
// Pass null if the weather hasn't loaded; watering and feeding still work.
//
// Returns: [{ ...getDailyRoutinePlants() fields,
//             tasks: [{ type, text, priority? }],
//             needsAttention: true if any task is more than info }]
export async function getDailyRoutine(db, weather) {
    const plants = await getDailyRoutinePlants(db);

    return plants.map((plant) => {
        const tasks = plant.care
            ? buildDailyTasks(plant.care, weather, {
                  // null (never) becomes DailyTask.js's "long ago" default
                  daysSinceWatered: plant.daysSinceWatered,
                  daysSinceFed: plant.daysSinceFed,
              })
            : [];
        return {
            ...plant,
            tasks,
            needsAttention: tasks.some((task) => task.type !== 'info'),
        };
    });
}

// ---------- Archive ----------

// Soft-deleted plants, most recently archived first.
// Returns: [{ gardenPlantId, commonName, scientificName, imageUri,
//             status, archivedAt }]
export function getArchivedPlants(db) {
    return db.getAllAsync(`
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               g.status,
               strftime('%Y-%m-%dT%H:%M:%SZ', g.archived_at) AS archivedAt
        FROM garden_plants g
        JOIN plants p ON p.plant_id = g.plant_id
        WHERE g.archived_at IS NOT NULL
        ORDER BY g.archived_at DESC, g.garden_plant_id DESC
    `);
}

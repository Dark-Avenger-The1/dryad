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


const REQUIREMENT_COLUMNS = `
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
`;

const REQUIREMENT_JOINS = `
    LEFT JOIN plant_requirements r ON r.plant_id = g.plant_id
    LEFT JOIN humidity_levels h    ON h.humidity_id = (
             SELECT humidity_id FROM humidity_levels
             WHERE max_score >= r.humidity_score
             ORDER BY max_score LIMIT 1)
`;


function requirementsFromRow(row) {
    if (row.requirementsPlantId === null) {
        return null;
    }
    return {
        soilNutrientLevel: row.soilNutrientLevel,
        lightLevel: row.lightLevel,
        ph: { min: row.minPh, max: row.maxPh },
        humidity: { level: row.humidityLevel, min: row.minHumidity, max: row.maxHumidity },
        temperatureC: { min: row.minTempC, max: row.maxTempC },
    };
}

const LIGHT_PHRASES = {
    'Shade': 'A shade-loving plant',
    'Partial sun': 'A partial-sun plant',
    'Full sun': 'A full-sun plant',
};

const HUMIDITY_PHRASES = {
    'Dry': 'dry air',
    'Moderate': 'moderate humidity',
    'Humid': 'humid air',
};


function describeRequirements(req) {
    if (!req) {
        return null;
    }
    const light = LIGHT_PHRASES[req.lightLevel] ?? 'A plant';
    const humidity = HUMIDITY_PHRASES[req.humidity.level] ?? `${req.humidity.min}-${req.humidity.max}% humidity`;
    return `${light} that likes ${humidity}, ${req.soilNutrientLevel.toLowerCase()}-nutrient soil, `
        + `pH ${req.ph.min}-${req.ph.max} and ${req.temperatureC.min}-${req.temperatureC.max}°C.`;
}


export async function getGardenPlantCards(db) {
    const rows = await db.getAllAsync(`
        SELECT g.garden_plant_id AS gardenPlantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               g.image_uri       AS imageUri,
               p.description,
               ${REQUIREMENT_COLUMNS}
        FROM garden_plants g
        JOIN plants p ON p.plant_id = g.plant_id
        ${REQUIREMENT_JOINS}
        WHERE g.status = 'planted'
          AND g.archived_at IS NULL
        ORDER BY p.common_name COLLATE NOCASE, g.garden_plant_id
    `);

    return rows.map((row) => {
        const requirements = requirementsFromRow(row);
        return {
            gardenPlantId: row.gardenPlantId,
            commonName: row.commonName,
            scientificName: row.scientificName,
            imageUri: row.imageUri,
            description: row.description ?? describeRequirements(requirements),
            requirements,
        };
    });
}


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
               ${REQUIREMENT_COLUMNS}
        FROM garden_plants g
        JOIN plants p ON p.plant_id = g.plant_id
        ${REQUIREMENT_JOINS}
        WHERE g.garden_plant_id = ?
        `,
        gardenPlantId
    );

    if (!row) {
        return null;
    }

    const requirements = requirementsFromRow(row);
    return {
        gardenPlantId: row.gardenPlantId,
        commonName: row.commonName,
        scientificName: row.scientificName,
        imageUri: row.imageUri,
        description: row.description ?? describeRequirements(requirements),
        status: row.status,
        plantedAt: row.plantedAt,
        archivedAt: row.archivedAt,
        dataConfidence: row.dataConfidence,
        requirements,
    };
}


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

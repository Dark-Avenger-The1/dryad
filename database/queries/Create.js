import { resolveGrowth } from '../../helper/PlantDefaults';
import { notifyGardenChanged } from '../events';
import { savePlantImage, deletePlantImage } from '../images';

// Higher = more trustworthy (see helper/PlantDefaults.js resolveGrowth)
const CONFIDENCE_RANK = { generic: 0, estimated: 1, verified: 2 };

function toNumber(value, field) {
    const number = Number(value);
    if (value === null || value === undefined || !Number.isFinite(number)) {
        throw new Error(`Plant requirement "${field}" is not a number: ${value}`);
    }
    return number;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}


function toRequirements(values) {
    const ph = [values.phMin, values.phMax]
        .map((v, i) => clamp(toNumber(v, i ? 'phMax' : 'phMin'), 0, 14));
    const temp = [values.minTempC, values.maxTempC]
        .map((v, i) => toNumber(v, i ? 'maxTempC' : 'minTempC'));
    const days = Number(values.daysToHarvest);

    return {
        light: clamp(toNumber(values.light, 'light'), 0, 10),
        humidity: clamp(toNumber(values.atmosphericHumidity, 'atmosphericHumidity'), 0, 10),
        soilNutrients: clamp(toNumber(values.soilNutriments, 'soilNutriments'), 0, 10),
        soilHumidity: clamp(toNumber(values.soilHumidity, 'soilHumidity'), 0, 12),
        minPh: Math.min(...ph),
        maxPh: Math.max(...ph),
        minTempC: Math.min(...temp),
        maxTempC: Math.max(...temp),
        daysToHarvest: Number.isInteger(days) && days > 0 ? days : null,
    };
}


export async function addScannedPlant(
    db,
    { scientificName, commonName, description = null, imageUri = null, trefleDetails = null }
) {
    const name = scientificName?.trim();
    if (!name) {
        throw new Error('addScannedPlant needs a scientificName');
    }

    const resolved = resolveGrowth(trefleDetails, name);
    const requirements = toRequirements(resolved.values);
    const confidence = resolved.confidence;
    const displayName = commonName?.trim() || trefleDetails?.commonName?.trim() || name;

    // Copy first: if the photo can't be saved, nothing is written
    const savedImageUri = await savePlantImage(imageUri);

    let gardenPlantId;

    try {
        await db.withTransactionAsync(async () => {
            const existing = await db.getFirstAsync(
                `SELECT plant_id AS plantId, data_confidence AS confidence
                 FROM plants WHERE scientific_name = ?`,
                name
            );

            let plantId;
            let saveRequirements = true;

            if (!existing) {
                const inserted = await db.getFirstAsync(
                    `INSERT INTO plants (scientific_name, common_name, description, data_confidence)
                     VALUES (?, ?, ?, ?)
                     RETURNING plant_id AS plantId`,
                    name, displayName, description, confidence
                );
                plantId = inserted.plantId;
            } else {
                plantId = existing.plantId;
                saveRequirements = CONFIDENCE_RANK[confidence] >= CONFIDENCE_RANK[existing.confidence];

                if (saveRequirements) {
                    await db.runAsync(
                        `UPDATE plants
                         SET common_name     = ?,
                             description     = COALESCE(?, description),
                             data_confidence = ?
                         WHERE plant_id = ?`,
                        displayName, description, confidence, plantId
                    );
                }
            }

            if (saveRequirements) {
                await db.runAsync(
                    `INSERT INTO plant_requirements (
                         plant_id, light_score, humidity_score, soil_nutrient_score,
                         soil_humidity_score, min_ph, max_ph, min_temp_c, max_temp_c,
                         days_to_harvest)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT (plant_id) DO UPDATE SET
                         light_score         = excluded.light_score,
                         humidity_score      = excluded.humidity_score,
                         soil_nutrient_score = excluded.soil_nutrient_score,
                         soil_humidity_score = excluded.soil_humidity_score,
                         min_ph              = excluded.min_ph,
                         max_ph              = excluded.max_ph,
                         min_temp_c          = excluded.min_temp_c,
                         max_temp_c          = excluded.max_temp_c,
                         days_to_harvest     = excluded.days_to_harvest`,
                    plantId,
                    requirements.light,
                    requirements.humidity,
                    requirements.soilNutrients,
                    requirements.soilHumidity,
                    requirements.minPh,
                    requirements.maxPh,
                    requirements.minTempC,
                    requirements.maxTempC,
                    requirements.daysToHarvest
                );
            }

            const garden = await db.getFirstAsync(
                `INSERT INTO garden_plants (plant_id, image_uri)
                 VALUES (?, ?)
                 RETURNING garden_plant_id AS gardenPlantId`,
                plantId, savedImageUri
            );
            gardenPlantId = garden.gardenPlantId;
        });
    } catch (error) {
        deletePlantImage(savedImageUri);
        throw error;
    }

    notifyGardenChanged({ type: 'added', gardenPlantId });
    return gardenPlantId;
}

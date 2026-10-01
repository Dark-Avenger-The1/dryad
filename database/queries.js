// Read queries for the My Garden tab.
//
// Every function takes the database as its first argument. Inside a component
// get it with useSQLiteContext() from 'expo-sqlite':
//
//     const db = useSQLiteContext();
//     const cards = await getGardenPlantCards(db);
//     const details = await getPlantDetails(db, cards[0].plantId);
//
// Column names are aliased to camelCase so results can be used directly in JSX.

// Everything a garden card shows, one row per plant, sorted A-Z by common name.
// description is the full text; shorten it on the card with
// <Text numberOfLines={2}> so the full text is still there for the pop-up.
//
// Returns: [{ plantId, commonName, scientificName, imageUrl, description }]
export function getGardenPlantCards(db) {
    return db.getAllAsync(`
        SELECT plant_id        AS plantId,
               common_name     AS commonName,
               scientific_name AS scientificName,
               image_url       AS imageUrl,
               description
        FROM plants
        ORDER BY common_name COLLATE NOCASE
    `);
}

// Everything the pop-up shows for one plant, fetched in a single query.
//
// Returns null if the plant does not exist, otherwise:
// {
//     plantId, commonName, scientificName, imageUrl, description,
//     requirements: {
//         soilTypes:    ['Loamy', 'Sandy'],     // A-Z, [] if none recorded
//         lightLevel:   'Full sun',
//         ph:           { min: 6.0, max: 7.0 },
//         humidity:     { min: 40, max: 60 },   // %, null if not recorded
//         temperatureC: { min: 15, max: 30 },
//     } | null                                  // null if no requirements row
// }
export async function getPlantDetails(db, plantId) {
    const row = await db.getFirstAsync(
        `
        SELECT p.plant_id        AS plantId,
               p.common_name     AS commonName,
               p.scientific_name AS scientificName,
               p.image_url       AS imageUrl,
               p.description,
               r.plant_id        AS requirementsPlantId,
               l.name            AS lightLevel,
               r.min_ph          AS minPh,
               r.max_ph          AS maxPh,
               r.min_humidity    AS minHumidity,
               r.max_humidity    AS maxHumidity,
               r.min_temp_c      AS minTempC,
               r.max_temp_c      AS maxTempC,
               (SELECT json_group_array(s.name ORDER BY s.name COLLATE NOCASE)
                FROM plant_soils ps
                JOIN soil_types s ON s.soil_id = ps.soil_id
                WHERE ps.plant_id = p.plant_id) AS soilTypesJson
        FROM plants p
        LEFT JOIN plant_requirements r ON r.plant_id = p.plant_id
        LEFT JOIN light_levels l       ON l.light_id = r.light_id
        WHERE p.plant_id = ?
        `,
        plantId
    );

    if (!row) {
        return null;
    }

    return {
        plantId: row.plantId,
        commonName: row.commonName,
        scientificName: row.scientificName,
        imageUrl: row.imageUrl,
        description: row.description,
        requirements: row.requirementsPlantId === null ? null : {
            soilTypes: JSON.parse(row.soilTypesJson),
            lightLevel: row.lightLevel,
            ph: { min: row.minPh, max: row.maxPh },
            humidity: row.minHumidity === null
                ? null
                : { min: row.minHumidity, max: row.maxHumidity },
            temperatureC: { min: row.minTempC, max: row.maxTempC },
        },
    };
}

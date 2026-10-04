// Read queries for the My Garden tab.

//Garden Cards
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

// Card Pop-ups
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

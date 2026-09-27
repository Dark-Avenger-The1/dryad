// Database schema, written as an ordered list of migrations.
//
// MIGRATIONS[0] is version 1, MIGRATIONS[1] is version 2, and so on.
// The app remembers which version it has applied and only runs newer ones,
// so existing data on users' phones is kept.
//
// HOW TO CHANGE THE DATABASE LATER
//   - Never edit a migration that has already shipped to users.
//   - Instead, add a new entry at the END of the array, e.g.:
//
//       // Version 2: care instructions
//       `
//           CREATE TABLE plant_instructions (...);
//       `,
//
//     or to add a column to an existing table:
//
//       // Version 3: watering frequency
//       `
//           ALTER TABLE plant_requirements ADD COLUMN watering_days INTEGER;
//       `,
//
// Lookup tables (plant_types, light_levels, soil_types) store each value once;
// other tables reference them by id instead of repeating free text.

export const MIGRATIONS = [
    // Version 1: initial structure
    `
        CREATE TABLE plant_types (
            type_id INTEGER PRIMARY KEY,
            name    TEXT NOT NULL UNIQUE COLLATE NOCASE   -- Flower, Fruit, Vegetable, Tree...
        );

        CREATE TABLE light_levels (
            light_id INTEGER PRIMARY KEY,
            name     TEXT NOT NULL UNIQUE COLLATE NOCASE  -- Full sun, Partial shade...
        );

        CREATE TABLE soil_types (
            soil_id INTEGER PRIMARY KEY,
            name    TEXT NOT NULL UNIQUE COLLATE NOCASE   -- Loamy, Sandy, Clay...
        );

        -- Basic info shown on a card
        CREATE TABLE plants (
            plant_id        INTEGER PRIMARY KEY AUTOINCREMENT,
            common_name     TEXT NOT NULL,
            scientific_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            type_id         INTEGER NOT NULL REFERENCES plant_types(type_id),
            image_url       TEXT,                     -- image path or URL
            description     TEXT
        );

        -- Growing requirements, exactly one row per plant
        CREATE TABLE plant_requirements (
            plant_id     INTEGER PRIMARY KEY
                             REFERENCES plants(plant_id) ON DELETE CASCADE,
            min_ph       REAL NOT NULL CHECK (min_ph BETWEEN 0 AND 14),
            max_ph       REAL NOT NULL CHECK (max_ph BETWEEN 0 AND 14),
            light_id     INTEGER NOT NULL REFERENCES light_levels(light_id),
            min_humidity REAL CHECK (min_humidity BETWEEN 0 AND 100),  -- air humidity, %
            max_humidity REAL CHECK (max_humidity BETWEEN 0 AND 100),
            min_temp_c   REAL NOT NULL,
            max_temp_c   REAL NOT NULL,

            CHECK (min_ph <= max_ph),
            CHECK (min_temp_c <= max_temp_c),
            CHECK (min_humidity <= max_humidity),
            -- humidity is optional, but give both values or neither
            CHECK ((min_humidity IS NULL) = (max_humidity IS NULL))
        );

        -- A plant can grow in several soil types
        CREATE TABLE plant_soils (
            plant_id INTEGER NOT NULL REFERENCES plants(plant_id) ON DELETE CASCADE,
            soil_id  INTEGER NOT NULL REFERENCES soil_types(soil_id),
            PRIMARY KEY (plant_id, soil_id)
        );

        CREATE INDEX idx_plants_type_id ON plants(type_id);
        CREATE INDEX idx_plant_requirements_light_id ON plant_requirements(light_id);
        CREATE INDEX idx_plant_soils_soil_id ON plant_soils(soil_id);
    `,
];

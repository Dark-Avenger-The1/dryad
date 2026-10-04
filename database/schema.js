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
//       // Version 3: notes
//       `
//           ALTER TABLE garden_plants ADD COLUMN notes TEXT;
//       `,
//
// HOW THE TABLES FIT TOGETHER
//
//   plants  1 ── 1  plant_requirements     species info + needs, saved once per species
//     │
//     1 ── many  garden_plants             the user's own plants (photo, status, care dates)
//                     │
//                     1 ── many  planting_step_checks   steps ticked while pending
//
//   light_levels, humidity_levels, soil_nutrient_levels turn Trefle's 0-10
//   scores into labels. A score belongs to the level with the smallest
//   max_score that is >= the score. The cut-offs match logic/FieldInterpreter.js,
//   so change both together.

export const MIGRATIONS = [
    // Version 1: initial structure
    `
        CREATE TABLE light_levels (
            light_id  INTEGER PRIMARY KEY,
            name      TEXT NOT NULL UNIQUE,
            max_score REAL NOT NULL UNIQUE
        );

        INSERT INTO light_levels (light_id, name, max_score) VALUES
            (1, 'Shade',       3),
            (2, 'Partial sun', 6),
            (3, 'Full sun',    10);

        CREATE TABLE humidity_levels (
            humidity_id INTEGER PRIMARY KEY,
            name        TEXT NOT NULL UNIQUE,
            max_score   REAL NOT NULL UNIQUE,
            min_percent INTEGER NOT NULL,             -- air humidity the plant likes, %
            max_percent INTEGER NOT NULL
        );

        INSERT INTO humidity_levels (humidity_id, name, max_score, min_percent, max_percent) VALUES
            (1, 'Dry',      3,  20, 45),
            (2, 'Moderate', 6,  45, 70),
            (3, 'Humid',    10, 70, 95);

        -- Trefle's soil_nutriments: 0-1 hyperoligotrophic ... 9-10 hypereutrophic
        CREATE TABLE soil_nutrient_levels (
            nutrient_id INTEGER PRIMARY KEY,
            name        TEXT NOT NULL UNIQUE,
            max_score   REAL NOT NULL UNIQUE
        );

        INSERT INTO soil_nutrient_levels (nutrient_id, name, max_score) VALUES
            (1, 'Very low',  1),                      -- hyperoligotrophic
            (2, 'Low',       3),
            (3, 'Medium',    6),
            (4, 'High',      8),
            (5, 'Very high', 10);                     -- hypereutrophic

        -- Species info from PlantNet/Trefle, shared by every garden plant of that species
        CREATE TABLE plants (
            plant_id        INTEGER PRIMARY KEY AUTOINCREMENT,
            common_name     TEXT NOT NULL,
            scientific_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            description     TEXT,
            -- where the requirements came from (see helper/PlantDefaults.js)
            data_confidence TEXT NOT NULL
                                CHECK (data_confidence IN ('verified', 'estimated', 'generic'))
        );

        -- Growing requirements, exactly one row per species.
        -- Scores use Trefle's scales so logic/ can rebuild care tips from them.
        CREATE TABLE plant_requirements (
            plant_id            INTEGER PRIMARY KEY
                                    REFERENCES plants(plant_id) ON DELETE CASCADE,
            light_score         REAL NOT NULL CHECK (light_score BETWEEN 0 AND 10),
            humidity_score      REAL NOT NULL CHECK (humidity_score BETWEEN 0 AND 10),
            soil_nutrient_score REAL NOT NULL CHECK (soil_nutrient_score BETWEEN 0 AND 10),
            soil_humidity_score REAL NOT NULL CHECK (soil_humidity_score BETWEEN 0 AND 12),
            min_ph              REAL NOT NULL CHECK (min_ph BETWEEN 0 AND 14),
            max_ph              REAL NOT NULL CHECK (max_ph BETWEEN 0 AND 14),
            min_temp_c          REAL NOT NULL,
            max_temp_c          REAL NOT NULL,
            days_to_harvest     INTEGER CHECK (days_to_harvest > 0),

            CHECK (min_ph <= max_ph),
            CHECK (min_temp_c <= max_temp_c)
        );

        -- The user's own plants. Times are UTC, as written by datetime('now').
        CREATE TABLE garden_plants (
            garden_plant_id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id        INTEGER NOT NULL REFERENCES plants(plant_id),
            image_uri       TEXT,                     -- photo the user scanned
            status          TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'planted')),
            created_at      TEXT NOT NULL DEFAULT (datetime('now')),
            planted_at      TEXT,
            last_watered_at TEXT,
            last_fed_at     TEXT,
            archived_at     TEXT,                     -- set = soft deleted (in Archive)

            CHECK ((status = 'planted') = (planted_at IS NOT NULL))
        );

        -- Planting steps the user has ticked while the plant is pending
        CREATE TABLE planting_step_checks (
            garden_plant_id INTEGER NOT NULL
                                REFERENCES garden_plants(garden_plant_id) ON DELETE CASCADE,
            step_index      INTEGER NOT NULL CHECK (step_index >= 0),
            PRIMARY KEY (garden_plant_id, step_index)
        ) WITHOUT ROWID;

        CREATE INDEX idx_garden_plants_plant_id ON garden_plants(plant_id);
        -- Home (pending), My Garden and Daily Routine (planted) only read active plants
        CREATE INDEX idx_garden_plants_active ON garden_plants(status, created_at)
            WHERE archived_at IS NULL;
        CREATE INDEX idx_garden_plants_archived ON garden_plants(archived_at)
            WHERE archived_at IS NOT NULL;
    `,
];

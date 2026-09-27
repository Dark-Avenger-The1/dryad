import { MIGRATIONS } from './schema';

// Passed to <SQLiteProvider onInit={...}>. Runs every time the app opens the
// database and applies any migrations from schema.js it hasn't applied yet.
// You shouldn't need to edit this file to change the schema.
export async function migrateDbIfNeeded(db) {
    // These settings are per-connection, so they are set on every launch
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
    `);

    const result = await db.getFirstAsync('PRAGMA user_version');
    const currentVersion = result?.user_version ?? 0;

    for (let version = currentVersion + 1; version <= MIGRATIONS.length; version++) {
        // Each migration and its version bump succeed or fail together,
        // so a crash can never leave the database half-updated.
        await db.withTransactionAsync(async () => {
            await db.execAsync(MIGRATIONS[version - 1]);
            await db.execAsync(`PRAGMA user_version = ${version}`);
        });
    }
}

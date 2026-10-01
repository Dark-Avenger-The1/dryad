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

    if (currentVersion >= MIGRATIONS.length) {
        return;
    }

    // Foreign keys are turned off while migrating so a migration can rebuild
    // a table (create new, copy, drop old, rename) without the drop
    // cascade-deleting child rows. This is the procedure SQLite recommends.
    // It must happen outside a transaction, where the pragma is a no-op.
    await db.execAsync('PRAGMA foreign_keys = OFF');
    try {
        for (let version = currentVersion + 1; version <= MIGRATIONS.length; version++) {
            // Each migration and its version bump succeed or fail together,
            // so a crash can never leave the database half-updated.
            await db.withTransactionAsync(async () => {
                await db.execAsync(MIGRATIONS[version - 1]);

                // Foreign keys were off, so check them by hand before committing
                const broken = await db.getAllAsync('PRAGMA foreign_key_check');
                if (broken.length > 0) {
                    throw new Error(
                        `Migration ${version} broke foreign keys: ${JSON.stringify(broken)}`
                    );
                }

                await db.execAsync(`PRAGMA user_version = ${version}`);
            });
        }
    } finally {
        await db.execAsync('PRAGMA foreign_keys = ON');
    }
}

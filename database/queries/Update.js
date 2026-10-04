// Update queries: functions that change data in the database (UPDATE).
//
// Follow the same pattern as Read.js: every function takes the database as
// its first argument, which a component gets with useSQLiteContext():
//
//     import { ... } from '../database/queries/Update';
//
//     const db = useSQLiteContext();
//
// Always pass values as parameters (?), never build SQL by joining strings.
// When one action touches several tables, wrap it in
// db.withTransactionAsync() so it fully succeeds or fully fails.

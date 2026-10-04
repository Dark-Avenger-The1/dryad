// Create queries: functions that add data in the database (INSERT).
//
// Follow the same pattern as Read.js: every function takes the database as
// its first argument, which a component gets with useSQLiteContext():
//
//     import { ... } from '../database/queries/Create';
//
//     const db = useSQLiteContext();
//
// Always pass values as parameters (?), never build SQL by joining strings.
// When one action touches several tables, wrap it in
// db.withTransactionAsync() so it fully succeeds or fully fails.

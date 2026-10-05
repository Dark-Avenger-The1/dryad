import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { onGardenChanged } from './events';

const INITIAL = { data: undefined, error: null, loading: true };

// Runs a query from database/queries/Read.js and re-runs it whenever the
// garden data changes. Use it in any screen:
//
//     const { data: plants, loading, error } = useLiveQuery(getGardenPlantCards);
//     const { data: plant } = useLiveQuery(getPlantDetails, gardenPlantId);
//
// Extra arguments are passed to the query after `db`. They must be stable
// between renders (numbers, strings, or values kept in state), otherwise the
// query re-runs on every render.
//
// No leaks: the change listener is removed when the screen unmounts or the
// arguments change, and results that arrive after that are ignored.
export function useLiveQuery(query, ...args) {
    const db = useSQLiteContext();
    const [state, setState] = useState(INITIAL);

    useEffect(() => {
        let active = true;
        let latestRun = 0;

        // Different arguments mean different data, so don't show the old result
        setState((prev) => (prev === INITIAL ? prev : INITIAL));

        const run = () => {
            const thisRun = ++latestRun;
            query(db, ...args).then(
                (data) => {
                    // Only the newest run may update the screen
                    if (active && thisRun === latestRun) {
                        setState({ data, error: null, loading: false });
                    }
                },
                (error) => {
                    if (active && thisRun === latestRun) {
                        setState((prev) => ({ ...prev, error, loading: false }));
                    }
                }
            );
        };

        run();
        const unsubscribe = onGardenChanged(run);

        return () => {
            active = false;
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, query, ...args]);

    return state;
}

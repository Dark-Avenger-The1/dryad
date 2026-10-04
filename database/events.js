// Change events for the garden data.
//
// Every write in queries/Create.js, Update.js and Delete.js calls
// notifyGardenChanged() after it succeeds. Screens listen through
// useLiveQuery() (database/useLiveQuery.js), so Home, My Garden, Daily Routine
// and Archive refresh themselves when a plant is added, planted, watered,
// archived or restored.
//
// One event is sent per finished action (after the transaction commits), so a
// screen never reads half-written data and refreshes once, not once per row.

const listeners = new Set();

// Returns a function that removes the listener. Always call it on cleanup.
export function onGardenChanged(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

// change: { type, gardenPlantId } describing what happened
export function notifyGardenChanged(change) {
    // Copy first so a listener that unsubscribes while running is safe
    for (const listener of [...listeners]) {
        try {
            listener(change);
        } catch (error) {
            // One broken screen must not stop the others from refreshing
            console.error('Garden change listener failed', error);
        }
    }
}

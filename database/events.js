// Change events for the garden data.
//


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

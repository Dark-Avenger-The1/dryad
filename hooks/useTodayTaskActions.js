import { useSQLiteContext } from 'expo-sqlite';

import { completeDailyTask } from '../database/queries/Update';
import { attempt, confirmAction } from '../helper/Alerts';

/**
 * Actions for items from getTodayTasks() in database/queries/Read.js.
 * The list refreshes by itself: completing a task fires a garden change event.
 */
export function useTodayTaskActions() {
  const db = useSQLiteContext();

  const complete = async (task) => {
    const confirmed = await confirmAction(
      'Are you done with this task?',
      `${task.commonName}: ${task.text}`,
      'Yes, done'
    );
    if (!confirmed) return;

    await attempt('Could not complete task', () =>
      completeDailyTask(db, task.gardenPlantId, task.type)
    );
  };

  return { complete };
}

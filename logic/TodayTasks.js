// ---------------------------------------------------------------------------
// 5. TODAY'S TASKS  (the actionable part of the daily routine)
// ---------------------------------------------------------------------------

// 'info' tasks are notes like "Next watering in 3 days", not something to do.
export function isActionable(task) {
  return task.type !== 'info';
}

/**
 * Flattens getDailyRoutine() plants into one list of tasks to do today,
 * high priority first.
 */
export function buildTodayTasks(routinePlants) {
  const tasks = [];

  for (const plant of routinePlants) {
    for (const task of plant.tasks) {
      if (!isActionable(task)) continue;
      tasks.push({
        key: `${plant.gardenPlantId}:${task.type}`,
        gardenPlantId: plant.gardenPlantId,
        commonName: plant.commonName,
        imageUri: plant.imageUri,
        type: task.type,
        text: task.text,
        priority: task.priority ?? 'normal',
      });
    }
  }

  return tasks.sort(
    (a, b) => (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1)
  );
}

import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import TodayTaskCard from '../components/TodayTaskCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';
import { WeatherContext } from '../context/WeatherContext';
import { useLiveQuery } from '../database/useLiveQuery';
import { getTodayTasks } from '../database/queries/Read';
import { useTodayTaskActions } from '../hooks/useTodayTaskActions';

export default function TodayTasksScreen() {
  const { weather, weatherError, day } = useContext(WeatherContext);
  const { data, loading, error } = useLiveQuery(getTodayTasks, weather, day);
  const { complete } = useTodayTaskActions();

  // Task whose circle stays filled while the confirmation is open
  const [checkingKey, setCheckingKey] = useState(null);

  const tasks = data ?? [];
  const waitingForWeather = !weather && !weatherError;

  const handleCheck = async (task) => {
    setCheckingKey(task.key);
    try {
      await complete(task);
    } finally {
      setCheckingKey(null);
    }
  };

  let subtitle;
  if (waitingForWeather) {
    subtitle = "Getting today's weather…";
  } else if (loading) {
    subtitle = 'Loading…';
  } else if (error) {
    subtitle = `Could not load tasks: ${error.message}`;
  } else if (tasks.length > 0) {
    subtitle = `${tasks.length} task${tasks.length === 1 ? '' : 's'} left for today`;
  } else {
    subtitle = 'All caught up';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {weatherError ? (
        <Text style={styles.note}>
          Weather is unavailable, so only watering and feeding are shown.
        </Text>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        {waitingForWeather || loading || error ? null : tasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Nothing needs your attention right now. Check back tomorrow.
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TodayTaskCard
              key={task.key}
              task={task}
              checked={checkingKey === task.key}
              onCheck={handleCheck}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  note: {
    fontFamily: FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.cta,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

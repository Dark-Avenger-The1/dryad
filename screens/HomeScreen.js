import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeShortcutCard from '../components/HomeShortcutCard';
import { COLORS, FONTS, SIZES, SPACING } from '../constant/constant';
import { WeatherContext } from '../context/WeatherContext';
import { useLiveQuery } from '../database/useLiveQuery';
import { getPendingPlants, getTodayTasks } from '../database/queries/Read';

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function pendingSubtitle({ data, loading, error }) {
  if (loading) return 'Loading…';
  if (error) return 'Could not load plants';
  if (data.length === 0) return 'Nothing waiting to be planted';
  return `${plural(data.length, 'plant')} waiting to be planted`;
}

function tasksSubtitle({ data, loading, error }, waitingForWeather) {
  if (waitingForWeather) return "Checking today's weather…";
  if (loading) return 'Loading…';
  if (error) return 'Could not load tasks';
  if (data.length === 0) return 'All caught up for today';
  return `${plural(data.length, 'task')} to do today`;
}

export default function HomeScreen({ navigation }) {
  const { weather, weatherError, day } = useContext(WeatherContext);

  const pending = useLiveQuery(getPendingPlants);
  const tasks = useLiveQuery(getTodayTasks, weather, day);

  const waitingForWeather = !weather && !weatherError;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    // Same top spacing as My Garden: below the notch / Dynamic Island.
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>{currentDate}</Text>

        <View style={styles.cards}>
          <HomeShortcutCard
            icon="alarm-outline"
            title="Needs Attention Today"
            subtitle={tasksSubtitle(tasks, waitingForWeather)}
            count={waitingForWeather ? 0 : tasks.data?.length ?? 0}
            actionLabel="View tasks"
            backgroundImage={require('../assets/home_sunflowers.jpg')}
            onPress={() => navigation.navigate('TodayTasks')}
            style={styles.card}
          />

          <HomeShortcutCard
            icon="hourglass-outline"
            title="Pending Plants"
            subtitle={pendingSubtitle(pending)}
            count={pending.data?.length ?? 0}
            actionLabel="View plants"
            backgroundImage={require('../assets/home_orange_tree.jpg')}
            onPress={() => navigation.navigate('PendingPlants')}
            style={styles.card}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginHorizontal: SPACING.lg,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  // The two cards split the space left under the title
  cards: {
    flex: 1,
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  card: {
    flex: 1,
  },
});

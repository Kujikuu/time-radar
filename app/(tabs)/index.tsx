import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo, MetricCard, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { useFocusTimer, useProgressMetrics, useStats, useTasks } from '@/src/features/focus/hooks';
import { TimerRing } from '@/src/features/focus/TimerRing';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const { tasks } = useTasks();
  const { summary } = useStats('Day');
  const progressMetrics = useProgressMetrics(summary);
  const { snapshot, toggle, reset, completePhase } = useFocusTimer();
  const nextTask = snapshot.task ?? tasks[0] ?? null;
  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <BrandLogo />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today</Text>
        <Text style={styles.date}>{todayDate}</Text>
      </View>

      <SoftCard style={styles.timerCard}>
        <TimerRing
          label={snapshot.phaseLabel}
          time={snapshot.timer ? snapshot.display : nextTask ? `${nextTask.focusMinutes}:00` : '0:00'}
          progress={snapshot.progress}
          primaryActionLabel={snapshot.primaryActionLabel}
          onPrimaryAction={() => toggle(nextTask?.id)}
          onReset={snapshot.timer ? reset : undefined}
          onComplete={snapshot.timer ? () => completePhase(false) : undefined}
        />
      </SoftCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.smallTitle}>Your Progress</Text>
        <Pressable onPress={() => router.push('/(tabs)/stats' as never)}>
          <Text style={styles.linkText}>See all</Text>
        </Pressable>
      </View>

      <View style={styles.metricsGrid}>
        {progressMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            icon={metric.icon}
            value={metric.value}
            label={metric.label}
            tone={metric.tone}
          />
        ))}
      </View>

      <Text style={styles.smallTitle}>Up Next</Text>
      {nextTask ? (
        <FocusTaskCard task={nextTask} />
      ) : (
        <SoftCard style={styles.emptyCard}>
          <Text style={styles.tipTitle}>No tasks yet</Text>
          <Text style={styles.tipText}>Create your first focus task to start a session.</Text>
        </SoftCard>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 22,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '500',
  },
  timerCard: {
    minHeight: 342,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: spacing.xxl,
  },
  smallTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: colors.textSoft,
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  emptyCard: {
    gap: 5,
    padding: spacing.lg,
  },
  tipTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  tipText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    lineHeight: 17,
  },
});

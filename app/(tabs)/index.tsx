import { IconChartDots, IconRadar } from '@tabler/icons-react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { AppIcon, IconButton, MetricCard, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { TimerRing } from '@/src/features/focus/TimerRing';
import { focusTasks, progressMetrics, today } from '@/src/features/focus/mock-data';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const nextTask = focusTasks[0];

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>TimeRadar</Text>
        </View>
        <IconButton icon={IconChartDots} label="Open productivity overview" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{today.label}</Text>
        <Text style={styles.date}>{today.date}</Text>
      </View>

      <SoftCard style={styles.timerCard}>
        <View style={styles.timerDust}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={[styles.dustDot, dustPosition(index)]} />
          ))}
        </View>
        <TimerRing label={today.timerLabel} time={today.timerDisplay} />
      </SoftCard>

      <View style={styles.sectionHeader}>
        <Text style={styles.smallTitle}>Your Progress</Text>
        <Text style={styles.linkText}>See all</Text>
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
      <FocusTaskCard task={nextTask} />

      <SoftCard style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <AppIcon icon={IconRadar} size={22} color={colors.accentDark} />
        </View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>Keep your rhythm tight</Text>
          <Text style={styles.tipText}>Start with one clean session, then review your focus score.</Text>
        </View>
      </SoftCard>
    </Screen>
  );
}

function dustPosition(index: number) {
  const positions: Pick<ViewStyle, 'left' | 'top'>[] = [
    { left: '10%', top: '24%' },
    { left: '18%', top: '48%' },
    { left: '14%', top: '70%' },
    { left: '30%', top: '18%' },
    { left: '38%', top: '82%' },
    { left: '52%', top: '12%' },
    { left: '58%', top: '76%' },
    { left: '72%', top: '22%' },
    { left: '80%', top: '48%' },
    { left: '86%', top: '70%' },
    { left: '23%', top: '32%' },
    { left: '40%', top: '38%' },
    { left: '64%', top: '35%' },
    { left: '74%', top: '61%' },
    { left: '31%', top: '63%' },
    { left: '54%', top: '58%' },
  ];

  return positions[index];
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
  appTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 24,
    fontWeight: '400',
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
    minHeight: 270,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: spacing.xl,
  },
  timerDust: {
    ...StyleSheet.absoluteFillObject,
  },
  dustDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  tipCopy: {
    flex: 1,
    gap: 3,
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

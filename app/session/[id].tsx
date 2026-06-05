import {
  IconChevronDown,
  IconChevronLeft,
  IconDots,
  IconFileText,
} from '@tabler/icons-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppIcon, IconButton, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { SessionOptionRow } from '@/src/features/focus/SessionOptionRow';
import { focusTasks } from '@/src/features/focus/mock-data';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = focusTasks.find((item) => item.id === id) ?? focusTasks[0];

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <IconButton icon={IconChevronLeft} label="Go back" onPress={() => router.back()} />
        <IconButton icon={IconDots} label="More session options" />
      </View>

      <View style={styles.hero}>
        <View style={styles.documentIcon}>
          <AppIcon icon={IconFileText} size={34} color={colors.accentDark} />
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.categoryPill}>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>{task.category}</Text>
          <AppIcon icon={IconChevronDown} size={17} color={colors.accentDark} />
        </View>
      </View>

      <SoftCard style={styles.optionsCard}>
        <SessionOptionRow label="Focus Duration" value={`${task.focusMinutes} min`} />
        <SessionOptionRow label="Short Break" value={`${task.shortBreakMinutes} min`} />
        <SessionOptionRow label="Long Break" value={`${task.longBreakMinutes} min`} />
        <SessionOptionRow label="Sessions" value={`${task.sessions}`} />
      </SoftCard>

      <SoftCard style={styles.optionsCard}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.optionTitle}>Auto Start Breaks</Text>
            <Text style={styles.optionSubtitle}>Start breaks automatically</Text>
          </View>
          <Switch
            value={task.autoStartBreaks}
            trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
            thumbColor={colors.accent}
          />
        </View>
        <SessionOptionRow label="Sound" value={task.sound} />
        <SessionOptionRow label="Background Sound" value={task.backgroundSound} />
      </SoftCard>

      <View style={styles.footerActions}>
        <PrimaryButton>Start Session</PrimaryButton>
        <Text style={styles.saveLink}>Save as Preset</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xl,
    paddingBottom: 34,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  documentIcon: {
    width: 74,
    height: 74,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 22,
    fontWeight: '500',
  },
  categoryPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  categoryText: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
  },
  optionsCard: {
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  switchRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    marginTop: 3,
  },
  footerActions: {
    gap: spacing.lg,
    marginTop: 'auto',
  },
  saveLink: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

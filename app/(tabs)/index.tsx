import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BrandLogo, MetricCard, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import {
  useFocusTimer,
  useNotificationPermissionStatus,
  useProgressMetrics,
  useSettings,
  useStats,
  useTasks,
} from '@/src/features/focus/hooks';
import { shouldShowNotificationPermissionPrompt } from '@/src/features/focus/notification-prompt-rules';
import { TimerRing } from '@/src/features/focus/TimerRing';
import { timerPhaseLabel } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const { tasks } = useTasks();
  const { formatDate, locale, t } = useTranslation();
  const { summary } = useStats('Day', locale);
  const progressMetrics = useProgressMetrics(summary, locale);
  const { snapshot, toggle, reset, completePhase } = useFocusTimer();
  const { settings, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const nextTask = snapshot.task ?? tasks[0] ?? null;
  const todayDate = formatDate(new Date(), {
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  });
  const primaryActionState = !snapshot.timer
    ? 'start'
    : snapshot.timer.status === 'running'
      ? 'pause'
      : 'resume';
  const primaryActionLabel =
    primaryActionState === 'start'
      ? t('timer.actions.startFocus')
      : t(`timer.actions.${primaryActionState}`);
  const phaseLabel = snapshot.timer
    ? timerPhaseLabel(locale, snapshot.timer.phase)
    : t('timer.phase.focus');
  const showNotificationPrompt = shouldShowNotificationPermissionPrompt({
    settings,
    permissionStatus: notificationPermission.status,
    placement: 'home',
  });

  const allowNotifications = async () => {
    const status = await notificationPermission.request();

    await save({
      notificationPermissionPromptCompleted: true,
      notificationsEnabled: status === 'granted',
    });
  };

  const dismissNotificationPrompt = async () => {
    await save({ notificationPermissionPromptCompleted: true });
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <BrandLogo />
      </View>

      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>{t('home.today')}</AppText>
        <AppText style={styles.date}>{todayDate}</AppText>
      </View>

      {showNotificationPrompt ? (
        <SoftCard style={styles.notificationPrompt}>
          <View style={styles.notificationCopy}>
            <AppText style={styles.tipTitle}>{t('home.notificationTitle')}</AppText>
            <AppText style={styles.tipText}>{t('home.notificationBody')}</AppText>
          </View>
          <View style={styles.notificationActions}>
            <PrimaryButton style={styles.notificationButton} onPress={allowNotifications}>
              {t('common.allowNotifications')}
            </PrimaryButton>
            <Pressable
              accessibilityLabel={t('common.notNow')}
              accessibilityRole="button"
              onPress={dismissNotificationPrompt}
              style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}>
              <AppText style={styles.dismissButtonText}>{t('common.notNow')}</AppText>
            </Pressable>
          </View>
        </SoftCard>
      ) : null}

      <SoftCard style={styles.timerCard}>
        <TimerRing
          label={phaseLabel}
          time={snapshot.timer ? snapshot.display : nextTask ? `${nextTask.focusMinutes}:00` : '0:00'}
          progress={snapshot.progress}
          primaryActionLabel={primaryActionLabel}
          primaryActionState={primaryActionState}
          onPrimaryAction={() => toggle(nextTask?.id)}
          onReset={snapshot.timer ? reset : undefined}
          onComplete={snapshot.timer ? () => completePhase(false) : undefined}
        />
      </SoftCard>

      <View style={styles.sectionHeader}>
        <AppText style={styles.smallTitle}>{t('home.progress')}</AppText>
        <Pressable
          accessibilityLabel={t('home.openStats')}
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/stats' as never)}>
          <AppText style={styles.linkText}>{t('common.seeAll')}</AppText>
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

      <AppText style={styles.smallTitle}>{t('home.upNext')}</AppText>
      {nextTask ? (
        <FocusTaskCard task={nextTask} />
      ) : (
        <SoftCard style={styles.emptyCard}>
          <AppText style={styles.tipTitle}>{t('home.noTasksTitle')}</AppText>
          <AppText style={styles.tipText}>{t('home.noTasksBody')}</AppText>
          <PrimaryButton
            style={styles.emptyAction}
            onPress={() => router.push('/task/new' as never)}>
            {t('home.noTasksAction')}
          </PrimaryButton>
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
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.heading,
    fontWeight: 'bold',
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
  notificationPrompt: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  notificationCopy: {
    gap: 5,
  },
  notificationActions: {
    gap: spacing.sm,
  },
  notificationButton: {
    minHeight: 46,
  },
  dismissButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyAction: {
    minHeight: 46,
    marginTop: spacing.xs,
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
  pressed: {
    opacity: 0.76,
  },
});

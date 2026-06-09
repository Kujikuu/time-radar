import { IconTrendingUp } from '@tabler/icons-react-native';
import { router, Tabs } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, BrandLogo, MetricCard, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { FocusTaskCard } from '@/src/features/focus/FocusTaskCard';
import { ImmersiveTimerView } from '@/src/features/focus/ImmersiveTimerView';
import {
  useFocusTimer,
  useCreateTask,
  useNotificationPermissionStatus,
  useProgressMetrics,
  useSettings,
  useStats,
  useTasks,
} from '@/src/features/focus/hooks';
import { shouldShowNotificationPermissionPrompt } from '@/src/features/focus/notification-prompt-rules';
import { buildRadarSignal } from '@/src/features/focus/stats-rules';
import { quickFocusTaskInput } from '@/src/features/focus/task-rules';
import { TimerRing } from '@/src/features/focus/TimerRing';
import { rowDirectionForTextDirection, textAlignForTextDirection, timerPhaseLabel } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const { tasks, reload: reloadTasks } = useTasks();
  const { direction, formatDate, locale, nativeDirection, t } = useTranslation();
  const { summary } = useStats('Day', locale);
  const radarSignal = buildRadarSignal(summary.focusMinutes);
  const progressMetrics = useProgressMetrics(summary, locale);
  const createTask = useCreateTask();
  const { snapshot, start, toggle, reset, completePhase } = useFocusTimer();
  const { settings, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const quickStartRef = useRef(false);
  const [isImmersiveTimerVisible, setImmersiveTimerVisible] = useState(false);
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
  const timerDisplay = snapshot.timer
    ? snapshot.display
    : nextTask
      ? `${nextTask.focusMinutes}:00`
      : `${settings.defaultFocusMinutes}:00`;
  const showNotificationPrompt = shouldShowNotificationPermissionPrompt({
    settings,
    permissionStatus: notificationPermission.status,
    placement: 'home',
  });
  const rowDirection = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
  const sectionTitleText = { textAlign: textAlignForTextDirection(direction) };

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

  const handleTimerPrimaryAction = async () => {
    if (snapshot.timer || nextTask) {
      await toggle(nextTask?.id);
      return;
    }

    if (quickStartRef.current) {
      return;
    }

    quickStartRef.current = true;
    try {
      const taskId = await createTask(quickFocusTaskInput(settings, t('quickStart.title')));
      await start(taskId);
      await reloadTasks();
    } finally {
      quickStartRef.current = false;
    }
  };

  const openImmersiveTimer = useCallback(() => {
    setImmersiveTimerVisible(true);
  }, []);

  const closeImmersiveTimer = useCallback(() => {
    setImmersiveTimerVisible(false);
  }, []);

  return (
    <>
      <Tabs.Screen
        options={{
          tabBarStyle: isImmersiveTimerVisible ? styles.hiddenTabBar : undefined,
        }}
      />
      {isImmersiveTimerVisible ? (
        <ImmersiveTimerView
          label={phaseLabel}
          time={timerDisplay}
          progress={snapshot.progress}
          primaryActionLabel={primaryActionLabel}
          primaryActionState={primaryActionState}
          surfaceAccessibilityLabel={t('timer.actions.exitFullscreen')}
          surfaceAccessibilityHint={t('timer.actions.exitFullscreenHint')}
          onPrimaryAction={handleTimerPrimaryAction}
          onExit={closeImmersiveTimer}
        />
      ) : (
        <Screen contentStyle={styles.screen}>
          <View style={styles.header}>
            <BrandLogo />
            <AppText style={styles.promise}>{t('home.promise')}</AppText>
            {settings.supporterPurchased && settings.supporterThemeEnabled ? (
              <AppText style={styles.supporterBadge}>{t('support.badge')}</AppText>
            ) : null}
          </View>

          <View style={[styles.sectionHeader, rowDirection]}>
            <AppText style={[styles.sectionTitle, sectionTitleText]}>{t('home.today')}</AppText>
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

          <SoftCard
            style={
              settings.supporterPurchased && settings.supporterThemeEnabled
                ? [styles.radarCard, styles.supporterRadarCard]
                : styles.radarCard
            }>
            <View style={[styles.radarHeader, rowDirection]}>
              <View style={styles.radarTitleGroup}>
                <AppText style={[styles.radarTitle, sectionTitleText]}>{t('radar.title')}</AppText>
                <AppText style={[styles.radarHelper, sectionTitleText]}>{t('radar.helper')}</AppText>
              </View>
              <View style={styles.radarIcon}>
                <AppIcon icon={IconTrendingUp} size={24} color={colors.accentDark} />
              </View>
            </View>
            <View style={styles.signalTrack}>
              <View style={[styles.signalFill, { width: `${radarSignal.percent}%` }]} />
            </View>
            <View style={[styles.radarFooter, rowDirection]}>
              <AppText style={styles.radarStatus}>
                {t(`radar.status.${radarSignal.status}`)}
              </AppText>
              <AppText selectable style={styles.radarPercent}>
                {t('radar.progress', { values: { percent: radarSignal.percent } })}
              </AppText>
            </View>
          </SoftCard>

          <SoftCard style={styles.timerCard}>
            <TimerRing
              label={phaseLabel}
              time={timerDisplay}
              progress={snapshot.progress}
              primaryActionLabel={primaryActionLabel}
              primaryActionState={primaryActionState}
              onPrimaryAction={handleTimerPrimaryAction}
              onReset={snapshot.timer ? reset : undefined}
              onComplete={snapshot.timer ? () => completePhase(false) : undefined}
              onSurfacePress={openImmersiveTimer}
              surfaceAccessibilityLabel={t('timer.actions.openFullscreen')}
              surfaceAccessibilityHint={t('timer.actions.openFullscreenHint')}
            />
          </SoftCard>

          <View style={[styles.sectionHeader, rowDirection]}>
            <AppText style={[styles.smallTitle, sectionTitleText]}>{t('home.progress')}</AppText>
            <Pressable
              accessibilityLabel={t('home.openStats')}
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/stats' as never)}>
              <AppText style={styles.linkText}>{t('common.seeAll')}</AppText>
            </Pressable>
          </View>

          <View style={[styles.metricsGrid, rowDirection]}>
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
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hiddenTabBar: {
    display: 'none',
  },
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  promise: {
    color: colors.textMuted,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  supporterBadge: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    color: colors.accentDark,
    fontSize: typography.size.eyebrow,
    fontWeight: typography.weight.extraBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    textAlign: 'center',
    backgroundColor: colors.surfacePeach,
  },
  sectionHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.size.heading,
    fontWeight: typography.weight.bold,
  },
  date: {
    flexShrink: 0,
    color: colors.textMuted,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
  },
  timerCard: {
    minHeight: 342,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: spacing.xxl,
  },
  radarCard: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundWarm,
  },
  supporterRadarCard: {
    borderColor: colors.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.supporterSurface,
  },
  radarHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  radarTitleGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  radarTitle: {
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  radarHelper: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  radarIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  signalTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  signalFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  radarFooter: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  radarStatus: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
  },
  radarPercent: {
    flexShrink: 0,
    color: colors.textMuted,
    fontSize: typography.size.caption,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.weight.semibold,
  },
  smallTitle: {
    flexShrink: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  linkText: {
    flexShrink: 0,
    color: colors.textSoft,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
  metricsGrid: {
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
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
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
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  pressed: {
    opacity: 0.76,
  },
});

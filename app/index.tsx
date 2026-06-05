import { IconFileText, IconTrendingUp } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppIcon, AppText, BrandLogo, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { useNotificationPermissionStatus, useSettings } from '@/src/features/focus/hooks';
import { shouldShowNotificationPermissionPrompt } from '@/src/features/focus/notification-prompt-rules';
import { RadarMark } from '@/src/features/focus/RadarMark';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

const onboardingSlides = [
  {
    id: 'focus',
    titleKey: null,
    bodyKey: 'onboarding.slides.focusBody',
    visual: 'radar',
  },
  {
    id: 'sessions',
    titleKey: 'onboarding.slides.sessionsTitle',
    bodyKey: 'onboarding.slides.sessionsBody',
    visual: 'session',
  },
  {
    id: 'progress',
    titleKey: 'onboarding.slides.progressTitle',
    bodyKey: 'onboarding.slides.progressBody',
    visual: 'stats',
  },
] as const;

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { settings, loading, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const { t } = useTranslation();
  const completed = loading ? null : settings.onboardingCompleted;
  const shouldOfferNotifications = shouldShowNotificationPermissionPrompt({
    settings,
    permissionStatus: notificationPermission.status,
    placement: 'onboarding',
  });

  useEffect(() => {
    if (completed) {
      router.replace('/(tabs)' as never);
    }
  }, [completed]);

  const enterApp = async (
    updates: Partial<typeof settings> = {}
  ) => {
    await save({ onboardingCompleted: true, ...updates });
    router.replace('/(tabs)' as never);

    const scrollHost = globalThis as {
      scrollTo?: (x: number, y: number) => void;
      setTimeout?: typeof setTimeout;
    };

    scrollHost.setTimeout?.(() => scrollHost.scrollTo?.(0, 0), 0);
  };

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: pageWidth * index, animated: true });
    setActiveIndex(index);
  };

  const handlePrimaryAction = () => {
    const nextIndex = activeIndex + 1;

    if (nextIndex >= onboardingSlides.length) {
      if (shouldOfferNotifications) {
        setShowNotificationPrompt(true);
        return;
      }

      enterApp();
      return;
    }

    goToPage(nextIndex);
  };

  if (completed === null || completed) {
    return <Screen scroll={false} contentStyle={styles.screen} />;
  }

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), onboardingSlides.length - 1));
  };

  const handleAllowNotifications = async () => {
    const status = await notificationPermission.request();

    await enterApp({
      notificationPermissionPromptCompleted: true,
      notificationsEnabled: status === 'granted',
    });
  };

  const handleSkipNotifications = async () => {
    await enterApp({
      notificationPermissionPromptCompleted: true,
      notificationsEnabled: false,
    });
  };

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View
        style={styles.carousel}
        onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}>
          {onboardingSlides.map((slide) => (
            <View key={slide.id} style={[styles.slide, { width: pageWidth || undefined }]}>
              <View style={styles.copy}>
                {slide.titleKey ? (
                  <AppText style={styles.title}>{t(slide.titleKey)}</AppText>
                ) : (
                  <BrandLogo variant="hero" />
                )}
                <AppText style={styles.subtitle}>{t(slide.bodyKey)}</AppText>
              </View>
              <OnboardingVisual type={slide.visual} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        {showNotificationPrompt ? (
          <SoftCard style={styles.notificationCard}>
            <View style={styles.notificationCopy}>
              <AppText style={styles.notificationTitle}>
                {t('onboarding.notificationTitle')}
              </AppText>
              <AppText style={styles.notificationBody}>{t('onboarding.notificationBody')}</AppText>
            </View>
            <PrimaryButton onPress={handleAllowNotifications}>
              {t('common.allowNotifications')}
            </PrimaryButton>
            <Pressable
              accessibilityLabel={t('common.notNow')}
              accessibilityRole="button"
              onPress={handleSkipNotifications}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <AppText style={styles.secondaryButtonText}>{t('common.notNow')}</AppText>
            </Pressable>
          </SoftCard>
        ) : (
          <>
            <PrimaryButton onPress={handlePrimaryAction}>
              {activeIndex === onboardingSlides.length - 1 ? t('onboarding.start') : t('common.next')}
            </PrimaryButton>
            <AppText style={styles.skip}>{t('onboarding.skip')}</AppText>
            <View style={styles.dots}>
              {onboardingSlides.map((slide, index) => (
                <Pressable
                  accessibilityLabel={t('onboarding.pageA11y', { values: { page: index + 1 } })}
                  accessibilityRole="button"
                  key={slide.id}
                  onPress={() => goToPage(index)}
                  style={[styles.dot, index === activeIndex && styles.activeDot]}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

function OnboardingVisual({ type }: { type: (typeof onboardingSlides)[number]['visual'] }) {
  const { t } = useTranslation();

  if (type === 'radar') {
    return <RadarMark />;
  }

  if (type === 'session') {
    return (
      <View style={styles.visualShell}>
        <SoftCard style={styles.sessionCard}>
          <View style={styles.sessionIcon}>
            <AppIcon icon={IconFileText} size={30} color={colors.accentDark} />
          </View>
          <AppText style={styles.visualTitle}>{t('onboarding.visual.projectProposal')}</AppText>
          <View style={styles.timerPill}>
            <AppText style={styles.timerPillText}>25:00</AppText>
          </View>
          <View style={styles.sessionRows}>
            {[
              t('taskForm.focusDuration'),
              t('taskForm.shortBreak'),
              t('taskForm.longBreak'),
            ].map((label, index) => (
              <View key={label} style={styles.sessionRow}>
                <AppText style={styles.sessionLabel}>{label}</AppText>
                <AppText style={styles.sessionValue}>
                  {index === 0 ? `25 ${t('units.min')}` : index === 1 ? `5 ${t('units.min')}` : `15 ${t('units.min')}`}
                </AppText>
              </View>
            ))}
          </View>
        </SoftCard>
      </View>
    );
  }

  return (
    <View style={styles.visualShell}>
      <SoftCard style={styles.statsCard}>
        <View style={styles.statHeader}>
          <AppText style={styles.visualTitle}>{t('onboarding.visual.today')}</AppText>
          <View style={styles.trendBadge}>
            <AppIcon icon={IconTrendingUp} size={18} color={colors.green} />
            <AppText style={styles.trendText}>+23%</AppText>
          </View>
        </View>
        <AppText style={styles.bigMetric}>2h 15m</AppText>
        <View style={styles.bars}>
          {[18, 42, 26, 70, 92, 54, 34, 48].map((height, index) => (
            <View key={`${height}-${index}`} style={[styles.bar, { height }]} />
          ))}
        </View>
        <View style={styles.scoreRow}>
          <AppText style={styles.sessionLabel}>{t('metrics.focusScore')}</AppText>
          <AppText style={styles.sessionValue}>85%</AppText>
        </View>
      </SoftCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingTop: 26,
    paddingBottom: 34,
  },
  carousel: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
  },
  slide: {
    flex: 1,
    minHeight: 610,
    justifyContent: 'space-evenly',
    gap: spacing.xl,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 30,
    fontWeight: '400',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.lg,
    paddingHorizontal: 14,
  },
  notificationCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  notificationCopy: {
    gap: spacing.sm,
  },
  notificationTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  notificationBody: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
  },
  skip: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.76,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  dot: {
    width: 9,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.accent,
  },
  visualShell: {
    width: '100%',
    maxWidth: 276,
    alignSelf: 'center',
  },
  sessionCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  sessionIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  visualTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 18,
    fontWeight: '700',
  },
  timerPill: {
    minWidth: 104,
    minHeight: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  timerPillText: {
    color: colors.white,
    fontFamily: typography.family,
    fontSize: 18,
    fontWeight: '800',
  },
  sessionRows: {
    width: '100%',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  sessionRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sessionLabel: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '600',
  },
  sessionValue: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '800',
  },
  statsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  trendText: {
    color: colors.green,
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '800',
  },
  bigMetric: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 32,
    fontWeight: '400',
  },
  bars: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  bar: {
    flex: 1,
    maxWidth: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

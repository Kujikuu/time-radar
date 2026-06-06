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

import { AppText, BrandLogo, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { useNotificationPermissionStatus, useSettings } from '@/src/features/focus/hooks';
import { shouldShowNotificationPermissionPrompt } from '@/src/features/focus/notification-prompt-rules';
import {
  OnboardingVisual,
  type OnboardingVisualType,
} from '@/src/features/onboarding/OnboardingVisual';
import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, spacing, typography } from '@/src/theme';

const onboardingSlides = [
  {
    id: 'focus',
    titleKey: null,
    bodyKey: 'onboarding.slides.focusBody',
    visual: 'radar' satisfies OnboardingVisualType,
  },
  {
    id: 'sessions',
    titleKey: 'onboarding.slides.sessionsTitle',
    bodyKey: 'onboarding.slides.sessionsBody',
    visual: 'session' satisfies OnboardingVisualType,
  },
  {
    id: 'progress',
    titleKey: 'onboarding.slides.progressTitle',
    bodyKey: 'onboarding.slides.progressBody',
    visual: 'stats' satisfies OnboardingVisualType,
  },
] as const;

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const { settings, loading, save } = useSettings();
  const notificationPermission = useNotificationPermissionStatus();
  const { direction, nativeDirection, t } = useTranslation();
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };
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
            <Pressable
              accessibilityLabel={t('onboarding.skip')}
              accessibilityRole="button"
              onPress={() => enterApp()}
              style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
              <AppText style={styles.skip}>{t('onboarding.skip')}</AppText>
            </Pressable>
            <View style={[styles.dots, contentRow]}>
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
    fontSize: typography.size.hero,
    fontWeight: typography.weight.regular,
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.subheading,
    lineHeight: typography.lineHeight.hero,
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
    fontSize: typography.size.subheading,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.title,
    textAlign: 'center',
  },
  notificationBody: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: typography.size.small,
    lineHeight: typography.lineHeight.paragraph,
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
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
  },
  skipButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.76,
  },
  dots: {
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
});

import { IconFileText, IconTrendingUp } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppIcon, BrandLogo, PrimaryButton, Screen, SoftCard } from '@/src/components';
import { useOnboardingStatus } from '@/src/features/focus/hooks';
import { RadarMark } from '@/src/features/focus/RadarMark';
import { colors, radius, spacing, typography } from '@/src/theme';

const onboardingSlides = [
  {
    id: 'focus',
    title: null,
    body: 'Focus deeply.\nBuild consistently.\nSee progress clearly.',
    visual: 'radar',
  },
  {
    id: 'sessions',
    title: 'Shape every block',
    body: 'Choose the task, set the rhythm, and keep breaks predictable.',
    visual: 'session',
  },
  {
    id: 'progress',
    title: 'Read your focus signal',
    body: 'Track sessions, focus time, and distribution without clutter.',
    visual: 'stats',
  },
] as const;

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const { completed, complete } = useOnboardingStatus();

  useEffect(() => {
    if (completed) {
      router.replace('/(tabs)' as never);
    }
  }, [completed]);

  const enterApp = async () => {
    await complete();
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
                {slide.title ? <Text style={styles.title}>{slide.title}</Text> : <BrandLogo variant="hero" />}
                <Text style={styles.subtitle}>{slide.body}</Text>
              </View>
              <OnboardingVisual type={slide.visual} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <PrimaryButton onPress={handlePrimaryAction}>
          {activeIndex === onboardingSlides.length - 1 ? "Let's Focus" : 'Next'}
        </PrimaryButton>
        <Text style={styles.skip}>I&apos;ll do this later</Text>
        <View style={styles.dots}>
          {onboardingSlides.map((slide, index) => (
            <Pressable
              accessibilityLabel={`Go to onboarding page ${index + 1}`}
              accessibilityRole="button"
              key={slide.id}
              onPress={() => goToPage(index)}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function OnboardingVisual({ type }: { type: (typeof onboardingSlides)[number]['visual'] }) {
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
          <Text style={styles.visualTitle}>Project Proposal</Text>
          <View style={styles.timerPill}>
            <Text style={styles.timerPillText}>25:00</Text>
          </View>
          <View style={styles.sessionRows}>
            {['Focus Duration', 'Short Break', 'Long Break'].map((label, index) => (
              <View key={label} style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>{label}</Text>
                <Text style={styles.sessionValue}>{index === 0 ? '25 min' : index === 1 ? '5 min' : '15 min'}</Text>
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
          <Text style={styles.visualTitle}>Today</Text>
          <View style={styles.trendBadge}>
            <AppIcon icon={IconTrendingUp} size={18} color={colors.green} />
            <Text style={styles.trendText}>+23%</Text>
          </View>
        </View>
        <Text style={styles.bigMetric}>2h 15m</Text>
        <View style={styles.bars}>
          {[18, 42, 26, 70, 92, 54, 34, 48].map((height, index) => (
            <View key={`${height}-${index}`} style={[styles.bar, { height }]} />
          ))}
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.sessionLabel}>Focus Score</Text>
          <Text style={styles.sessionValue}>85%</Text>
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
  skip: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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

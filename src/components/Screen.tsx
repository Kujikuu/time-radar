import { usePathname } from 'expo-router';
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { colors } from '@/src/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact';
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
}>;

export function Screen({
  children,
  scroll = true,
  contentStyle,
  variant = 'default',
  refreshing = false,
  onRefresh,
}: ScreenProps) {
  const pathname = usePathname();
  const scrollRef = useRef<ScrollView>(null);
  const { direction } = useLocale();
  const { isCompact, isWide } = useLayoutProfile();
  const webDirectionProps =
    process.env.EXPO_OS === 'web' ? ({ dir: direction } as Record<string, string>) : {};

  const contentLayoutStyle = useMemo(() => {
    if (variant === 'compact' || isCompact) {
      return styles.contentCompact;
    }

    if (isWide) {
      return styles.contentWide;
    }

    return styles.contentRegular;
  }, [isCompact, isWide, variant]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const scrollHost = globalThis as { scrollTo?: (x: number, y: number) => void };
    scrollHost.scrollTo?.(0, 0);
  }, [pathname]);

  const content = (
    <View {...webDirectionProps} style={[styles.contentBase, contentLayoutStyle, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            ) : undefined
          }
          bounces>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentBase: {
    flex: 1,
    width: '100%',
    paddingTop: 18,
    paddingBottom: 24,
  },
  contentCompact: {
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  contentRegular: {
    paddingHorizontal: 24,
  },
  contentWide: {
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
});

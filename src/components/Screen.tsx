import { usePathname } from 'expo-router';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocale } from '@/src/i18n/LocaleProvider';
import { colors } from '@/src/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
}>;

export function Screen({ children, scroll = true, contentStyle }: ScreenProps) {
  const pathname = usePathname();
  const scrollRef = useRef<ScrollView>(null);
  const { direction } = useLocale();
  const webDirectionProps =
    Platform.OS === 'web' ? ({ dir: direction } as Record<string, string>) : {};

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    const scrollHost = globalThis as { scrollTo?: (x: number, y: number) => void };
    scrollHost.scrollTo?.(0, 0);
  }, [pathname]);

  const content = (
    <View {...webDirectionProps} style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
});

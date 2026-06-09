import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TablerIcon } from '@/src/components';
import { AppIcon, AppText, BrandLogo } from '@/src/components';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import {
  sidebarItemRowDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import {
  sidebarTabRouteOrder,
  type BottomTabRouteName,
} from '@/src/navigation/tab-rules';
import { useSidebarWidth } from '@/src/navigation/tablet-sidebar-metrics';
import { colors, radius, spacing, typography } from '@/src/theme';

type TabletSidebarNavigationProps = {
  tabConfig: Record<
    BottomTabRouteName,
    {
      title: string;
      icon: TablerIcon;
      activeIcon: TablerIcon;
    }
  >;
};

function resolveActiveTab(pathname: string): BottomTabRouteName {
  if (pathname.includes('/settings')) {
    return 'settings';
  }

  if (pathname.includes('/stats')) {
    return 'stats';
  }

  if (pathname.includes('/tasks')) {
    return 'tasks';
  }

  return 'index';
}

function tabHref(name: BottomTabRouteName) {
  return name === 'index' ? '/(tabs)' : `/(tabs)/${name}`;
}

export function TabletSidebarNavigation({ tabConfig }: TabletSidebarNavigationProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const sidebarWidth = useSidebarWidth();
  const { width } = useLayoutProfile();
  const { direction } = useTranslation();
  const showLabels = width >= 1000;
  const activeTab = resolveActiveTab(pathname);
  const itemRowDirection = sidebarItemRowDirection(direction);
  const labelTextAlign = textAlignForTextDirection(direction);
  const orderedRoutes = sidebarTabRouteOrder();

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          borderEndWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      <BrandLogo
        variant="header"
        style={[
          showLabels ? styles.logoLabeled : styles.logoRail,
          direction === 'rtl' ? styles.logoRtl : styles.logoLtr,
        ]}
      />

      <View style={styles.tabList}>
        {orderedRoutes.map((name) => {
          const config = tabConfig[name];
          const isFocused = activeTab === name;
          const activeColor = colors.accentDark;
          const inactiveColor = colors.textMuted;
          const color = isFocused ? activeColor : inactiveColor;
          const Icon = isFocused ? config.activeIcon : config.icon;

          return (
            <PlatformPressable
              key={name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : undefined}
              accessibilityLabel={config.title}
              onPress={() => router.push(tabHref(name) as never)}
              onPressIn={() => {
                if (process.env.EXPO_OS === 'ios') {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={[
                styles.tabItem,
                showLabels ? styles.tabItemLabeled : styles.tabItemRail,
                { flexDirection: itemRowDirection },
                isFocused && styles.tabItemActive,
              ]}>
              <View style={styles.tabIcon}>
                <AppIcon icon={Icon} size={24} color={color} />
              </View>
              {showLabels ? (
                <AppText
                  numberOfLines={2}
                  style={[
                    styles.tabLabel,
                    { color, textAlign: labelTextAlign },
                    isFocused && styles.tabLabelActive,
                  ]}>
                  {config.title}
                </AppText>
              ) : null}
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.xl,
  },
  logoRail: {
    alignSelf: 'center',
    width: 56,
    height: 13,
  },
  logoLabeled: {
    marginHorizontal: spacing.sm,
  },
  logoLtr: {
    alignSelf: 'flex-start',
  },
  logoRtl: {
    alignSelf: 'flex-end',
  },
  tabList: {
    flex: 1,
    gap: spacing.sm,
  },
  tabItem: {
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.md,
    minHeight: 48,
  },
  tabItemRail: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  tabItemLabeled: {
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tabItemActive: {
    backgroundColor: colors.surfacePeach,
  },
  tabIcon: {
    flexShrink: 0,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    flexShrink: 1,
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
  },
  tabLabelActive: {
    fontWeight: typography.weight.bold,
  },
});

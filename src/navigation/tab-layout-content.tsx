import {
  IconChartPie,
  IconChartPieFilled,
  IconListDetails,
  IconListDetailsFilled,
  IconSettings,
  IconSettingsFilled,
  IconSmartHome,
} from '@tabler/icons-react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/src/components';
import { HapticTab } from '@/src/components/HapticTab';
import { TabletSidebarNavigation } from '@/src/components/TabletSidebarNavigation';
import { useLayoutProfile } from '@/src/hooks/use-layout-profile';
import { structuralRowDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import {
  NavigationChromeProvider,
  useNavigationChromeVisibility,
} from '@/src/navigation/chrome-visibility';
import {
  bottomTabRouteOrder,
  type BottomTabRouteName,
} from '@/src/navigation/tab-rules';
import { colors, radius } from '@/src/theme';

export const bottomTabBarStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 78,
  paddingTop: 10,
  paddingBottom: 10,
  paddingHorizontal: 12,
  borderTopLeftRadius: radius.lg,
  borderTopRightRadius: radius.lg,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.border,
  backgroundColor: colors.backgroundWarm,
  overflow: 'hidden',
} as const;

export function TabsNavigationLayout() {
  return (
    <NavigationChromeProvider>
      <TabLayoutContent />
    </NavigationChromeProvider>
  );
}

function TabLayoutContent() {
  const { direction, t } = useTranslation();
  const { isWide } = useLayoutProfile();
  const { isNavigationChromeHidden } = useNavigationChromeVisibility();
  const tabConfig = {
    index: {
      title: t('home.title'),
      icon: IconSmartHome,
      activeIcon: IconSmartHome,
    },
    tasks: {
      title: t('tasks.title'),
      icon: IconListDetails,
      activeIcon: IconListDetailsFilled,
    },
    stats: {
      title: t('stats.title'),
      icon: IconChartPie,
      activeIcon: IconChartPieFilled,
    },
    settings: {
      title: t('settings.title'),
      icon: IconSettings,
      activeIcon: IconSettingsFilled,
    },
  } satisfies Record<
    BottomTabRouteName,
    {
      title: string;
      icon: typeof IconSmartHome;
      activeIcon: typeof IconSmartHome;
    }
  >;

  return (
    <View
      style={[
        styles.root,
        isWide && styles.rootWide,
        isWide && { flexDirection: structuralRowDirection(direction) },
      ]}>
      {isWide && !isNavigationChromeHidden ? (
        <TabletSidebarNavigation tabConfig={tabConfig} />
      ) : null}
      <View style={styles.content}>
        <Tabs
          safeAreaInsets={{
            bottom: 0,
          }}
          tabBar={(props) => (isWide ? null : <BottomTabBar {...props} />)}
          screenOptions={{
            tabBarActiveTintColor: colors.accentDark,
            tabBarInactiveTintColor: colors.textMuted,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarShowLabel: false,
            tabBarStyle: isWide ? styles.hiddenTabBar : bottomTabBarStyle,
            tabBarItemStyle: {
              borderRadius: radius.md,
              borderCurve: 'continuous',
              justifyContent: 'center',
            },
          }}>
          {bottomTabRouteOrder(direction).map((name) => {
            const config = tabConfig[name];

            return (
              <Tabs.Screen
                key={name}
                name={name}
                options={{
                  title: config.title,
                  tabBarIcon: ({ color, focused }) => (
                    <AppIcon
                      icon={focused ? config.activeIcon : config.icon}
                      size={24}
                      color={color}
                    />
                  ),
                }}
              />
            );
          })}
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootWide: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  hiddenTabBar: {
    display: 'none',
  },
});

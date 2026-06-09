import {
  IconChartPie,
  IconChartPieFilled,
  IconListDetails,
  IconListDetailsFilled,
  IconSettings,
  IconSettingsFilled,
  IconSmartHome,
} from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { AppIcon } from '@/src/components';
import { HapticTab } from '@/src/components/HapticTab';
import { useTranslation } from '@/src/i18n/LocaleProvider';
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

export default function TabLayout() {
  const { direction, t } = useTranslation();
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
    <Tabs
      safeAreaInsets={{
        bottom: 0,
      }}
      screenOptions={{
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: bottomTabBarStyle,
        tabBarItemStyle: {
          borderRadius: radius.md,
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
  );
}

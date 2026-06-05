import {
  IconChartPie,
  IconChartPieFilled,
  IconListDetails,
  IconListDetailsFilled,
  IconSettings,
  IconSettingsFilled,
  IconSmartHome
} from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { AppIcon } from '@/src/components';
import { colors, radius } from '@/src/theme';

export default function TabLayout() {
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
        tabBarStyle: {
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
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
          justifyContent: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon icon={focused ? IconSmartHome : IconSmartHome} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon icon={focused ? IconListDetailsFilled : IconListDetails} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon icon={focused ? IconChartPieFilled : IconChartPie} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon icon={focused ? IconSettingsFilled : IconSettings} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

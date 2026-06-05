import {
  IconChartDots3,
  IconChartDots3Filled,
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
import { colors, radius, typography } from '@/src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: colors.backgroundWarm,
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
        },
        tabBarLabelStyle: {
          fontFamily: typography.family,
          fontSize: 11,
          fontWeight: '600',
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
          tabBarIcon: ({ color, focused }) => <AppIcon icon={focused ? IconChartDots3Filled : IconChartDots3} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <AppIcon icon={focused ? IconSettingsFilled : IconSettings} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, typography } from '@/src/theme';

type MetricCardProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string;
  label: string;
  tone?: 'accent' | 'green' | 'amber';
};

const toneColor = {
  accent: colors.accent,
  green: colors.green,
  amber: colors.amber,
};

export function MetricCard({ icon, value, label, tone = 'accent' }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon} size={25} color={toneColor[tone]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 100,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.small,
  },
  value: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
  },
});

import { StyleSheet, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme';

import { AppText } from './AppText';
import { AppIcon, TablerIcon } from './AppIcon';

type MetricCardProps = {
  icon: TablerIcon;
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
    <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.card}>
      <AppIcon icon={icon} size={24} color={toneColor[tone]} />
      <AppText selectable style={styles.value}>
        {value}
      </AppText>
      <AppText style={styles.label}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
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

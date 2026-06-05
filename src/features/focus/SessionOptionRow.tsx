import { IconChevronRight } from '@tabler/icons-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, TablerIcon } from '@/src/components';
import { colors, typography } from '@/src/theme';

type SessionOptionRowProps = {
  label: string;
  value: string;
  showChevron?: boolean;
  icon?: TablerIcon;
};

export function SessionOptionRow({
  label,
  value,
  showChevron = true,
  icon,
}: SessionOptionRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        {icon ? <AppIcon icon={icon} size={18} color={colors.textMuted} /> : null}
        <Text style={styles.value}>{value}</Text>
        {showChevron ? (
          <AppIcon icon={IconChevronRight} size={20} color={colors.text} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '600',
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  value: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
  },
});

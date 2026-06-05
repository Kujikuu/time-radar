import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme';

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const isActive = option === value;

        return (
          <Pressable
            accessibilityLabel={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, isActive && styles.activeSegment]}>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.accentDark,
    fontWeight: '700',
  },
});

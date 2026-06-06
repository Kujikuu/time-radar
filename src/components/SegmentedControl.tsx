import { Pressable, StyleSheet, View } from 'react-native';

import { rowDirectionForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, typography } from '@/src/theme';

import { AppText } from './AppText';

type SegmentedControlOption<T extends string> = T | { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { direction, nativeDirection } = useTranslation();
  const controlDirection = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.wrapper, controlDirection]}>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const isActive = optionValue === value;

        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={optionValue}
            onPress={() => onChange(optionValue)}
            style={[styles.segment, isActive && styles.activeSegment]}>
            <AppText style={[styles.label, isActive && styles.activeLabel]}>{label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 44,
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
    flexShrink: 1,
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.accentDark,
    fontWeight: '700',
  },
});

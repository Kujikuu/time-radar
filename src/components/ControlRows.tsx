import { IconMinus, IconPlus } from '@tabler/icons-react-native';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import {
  rowDirectionForTextDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

import { AppIcon, type TablerIcon } from './AppIcon';
import { AppText } from './AppText';

type StepperRowProps = {
  label: string;
  helper?: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function StepperRow({
  label,
  helper,
  value,
  suffix,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: StepperRowProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;
  const { direction, nativeDirection, t } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.controlRow, contentRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <AppText style={[styles.rowTitle, styles.tileText, tileText]}>{label}</AppText>
        {helper ? (
          <AppText style={[styles.helper, styles.tileText, tileText]}>{helper}</AppText>
        ) : null}
      </View>
      <View style={styles.stepper}>
        <StepperButton
          label={t('settings.decrease', { values: { label } })}
          icon={IconMinus}
          disabled={!canDecrease}
          onPress={() => onChange(Math.max(min, value - step))}
        />
        <View style={styles.stepperValue}>
          <AppText style={styles.stepperNumber}>{value}</AppText>
          <AppText style={styles.stepperSuffix}>{suffix}</AppText>
        </View>
        <StepperButton
          label={t('settings.increase', { values: { label } })}
          icon={IconPlus}
          disabled={!canIncrease}
          onPress={() => onChange(Math.min(max, value + step))}
        />
      </View>
    </View>
  );
}

function StepperButton({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: TablerIcon;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        disabled && styles.stepperButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <AppIcon icon={icon} size={18} color={disabled ? colors.textSoft : colors.accentDark} />
    </Pressable>
  );
}

type SwitchRowProps = {
  label: string;
  helper: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

export function SwitchRow({
  label,
  helper,
  value,
  disabled = false,
  onValueChange,
}: SwitchRowProps) {
  const { direction, nativeDirection } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <View style={[styles.controlRow, contentRow, disabled && styles.disabled]}>
      <View style={styles.controlCopy}>
        <AppText style={[styles.rowTitle, styles.tileText, tileText]}>{label}</AppText>
        <AppText style={[styles.helper, styles.tileText, tileText]}>{helper}</AppText>
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityState={{ disabled, checked: value }}
        disabled={disabled}
        hitSlop={12}
        value={value}
        onValueChange={onValueChange}
        style={styles.switchControl}
        trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
        thumbColor={value ? colors.accent : colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  controlCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTitle: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.size.control,
    fontWeight: typography.weight.bold,
  },
  helper: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.helper,
  },
  tileText: {
    minWidth: 0,
  },
  stepper: {
    minWidth: 144,
    flexShrink: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.backgroundWarm,
  },
  stepperButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchControl: {
    minWidth: 44,
    minHeight: 44,
  },
  stepperButtonDisabled: {
    opacity: 0.42,
  },
  stepperValue: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperNumber: {
    color: colors.text,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
    fontVariant: ['tabular-nums'],
  },
  stepperSuffix: {
    color: colors.textMuted,
    fontSize: typography.size.micro,
    fontWeight: typography.weight.bold,
    marginTop: -2,
  },
  disabled: {
    opacity: 0.52,
  },
  pressed: {
    opacity: 0.76,
  },
});

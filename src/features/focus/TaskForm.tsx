import { useMemo, useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { AppText, PrimaryButton, SegmentedControl, SoftCard } from '@/src/components';
import { focusCategoryOptions, fontFamilyForLocale, textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

import { FocusCategory, TaskInput } from './types';

type TaskFormProps = {
  initialValue: TaskInput;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void | Promise<void>;
};

export function TaskForm({ initialValue, submitLabel, onSubmit }: TaskFormProps) {
  const { direction, locale, t } = useTranslation();
  const toggleText = { textAlign: textAlignForTextDirection(direction) };
  const [title, setTitle] = useState(initialValue.title);
  const [category, setCategory] = useState<FocusCategory>(initialValue.category);
  const [focusMinutes, setFocusMinutes] = useState(String(initialValue.focusMinutes));
  const [shortBreakMinutes, setShortBreakMinutes] = useState(String(initialValue.shortBreakMinutes));
  const [longBreakMinutes, setLongBreakMinutes] = useState(String(initialValue.longBreakMinutes));
  const [sessions, setSessions] = useState(String(initialValue.sessions));
  const [autoStartBreaks, setAutoStartBreaks] = useState(initialValue.autoStartBreaks);

  const input = useMemo<TaskInput>(
    () => ({
      title,
      category,
      focusMinutes: readMinutes(focusMinutes, initialValue.focusMinutes),
      shortBreakMinutes: readMinutes(shortBreakMinutes, initialValue.shortBreakMinutes),
      longBreakMinutes: readMinutes(longBreakMinutes, initialValue.longBreakMinutes),
      sessions: readMinutes(sessions, initialValue.sessions),
      sound: initialValue.sound,
      backgroundSound: initialValue.backgroundSound,
      autoStartBreaks,
    }),
    [
      autoStartBreaks,
      category,
      focusMinutes,
      initialValue.backgroundSound,
      initialValue.focusMinutes,
      initialValue.longBreakMinutes,
      initialValue.sessions,
      initialValue.shortBreakMinutes,
      initialValue.sound,
      longBreakMinutes,
      sessions,
      shortBreakMinutes,
      title,
    ]
  );

  return (
    <View style={styles.wrapper}>
      <SoftCard style={styles.card}>
        <View style={styles.field}>
          <AppText style={styles.label}>{t('taskForm.taskName')}</AppText>
          <TextInput
            accessibilityLabel={t('taskForm.taskNameA11y')}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              {
                fontFamily: fontFamilyForLocale(locale),
                textAlign: 'left',
                writingDirection: direction,
              },
            ]}
          />
        </View>

        <View style={styles.field}>
          <AppText style={styles.label}>{t('taskForm.category')}</AppText>
          <SegmentedControl
            options={focusCategoryOptions(locale)}
            value={category}
            onChange={setCategory}
          />
        </View>
      </SoftCard>

      <SoftCard style={styles.card}>
        <NumberField
          label={t('taskForm.focusDuration')}
          value={focusMinutes}
          onChangeText={setFocusMinutes}
        />
        <NumberField
          label={t('taskForm.shortBreak')}
          value={shortBreakMinutes}
          onChangeText={setShortBreakMinutes}
        />
        <NumberField
          label={t('taskForm.longBreak')}
          value={longBreakMinutes}
          onChangeText={setLongBreakMinutes}
        />
        <NumberField
          label={t('taskForm.sessionsBeforeLongBreak')}
          value={sessions}
          onChangeText={setSessions}
        />
      </SoftCard>

      <SoftCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <AppText style={[styles.label, styles.toggleText, toggleText]}>
              {t('taskForm.autoStartBreaks')}
            </AppText>
            <AppText style={[styles.helper, styles.toggleText, toggleText]}>
              {t('taskForm.autoStartBreaksHelper')}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t('taskForm.autoStartBreaks')}
            value={autoStartBreaks}
            onValueChange={setAutoStartBreaks}
            trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
            thumbColor={colors.accent}
          />
        </View>
      </SoftCard>

      <PrimaryButton onPress={() => onSubmit(input)}>{submitLabel}</PrimaryButton>
    </View>
  );
}

function NumberField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { direction, locale } = useTranslation();

  return (
    <View style={styles.numberRow}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        style={[
          styles.numberInput,
          {
            fontFamily: fontFamilyForLocale(locale),
            textAlign: 'center',
            writingDirection: direction,
          },
        ]}
      />
    </View>
  );
}

function readMinutes(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
  },
  helper: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundWarm,
  },
  numberRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  numberInput: {
    width: 82,
    minHeight: 42,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    backgroundColor: colors.backgroundWarm,
  },
  switchRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  switchCopy: {
    flex: 1,
    gap: 3,
  },
  toggleText: {
    width: '100%',
  },
});

import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  AppText,
  PrimaryButton,
  SegmentedControl,
  SoftCard,
  StepperRow,
  SwitchRow,
} from '@/src/components';
import {
  focusCategoryOptions,
  fontFamilyForLocale,
  textAlignForTextDirection,
} from '@/src/i18n';
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
  const [title, setTitle] = useState(initialValue.title);
  const [category, setCategory] = useState<FocusCategory>(initialValue.category);
  const [focusMinutes, setFocusMinutes] = useState(initialValue.focusMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialValue.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialValue.longBreakMinutes);
  const [sessions, setSessions] = useState(initialValue.sessions);
  const [autoStartBreaks, setAutoStartBreaks] = useState(initialValue.autoStartBreaks);
  const [titleError, setTitleError] = useState<string | null>(null);

  const input = useMemo<TaskInput>(
    () => ({
      title,
      category,
      focusMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      sessions,
      sound: initialValue.sound,
      backgroundSound: initialValue.backgroundSound,
      autoStartBreaks,
    }),
    [
      autoStartBreaks,
      category,
      focusMinutes,
      initialValue.backgroundSound,
      initialValue.sound,
      longBreakMinutes,
      sessions,
      shortBreakMinutes,
      title,
    ]
  );

  const updateTitle = (nextTitle: string) => {
    setTitle(nextTitle);
    if (titleError) {
      setTitleError(null);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError(t('taskForm.taskNameRequired'));
      return;
    }

    onSubmit(input);
  };

  return (
    <View style={styles.wrapper}>
      <SoftCard style={styles.card}>
        <View style={styles.field}>
          <AppText style={styles.label}>{t('taskForm.taskName')}</AppText>
          <TextInput
            accessibilityLabel={t('taskForm.taskNameA11y')}
            placeholder={t('taskForm.taskNamePlaceholder')}
            placeholderTextColor={colors.textSoft}
            value={title}
            onChangeText={updateTitle}
            style={[
              styles.input,
              titleError ? styles.inputError : null,
              {
                fontFamily: fontFamilyForLocale(locale),
                textAlign: textAlignForTextDirection(direction),
                writingDirection: direction,
              },
            ]}
          />
          {titleError ? <AppText style={styles.errorText}>{titleError}</AppText> : null}
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
        <StepperRow
          label={t('taskForm.focusDuration')}
          value={focusMinutes}
          suffix={t('units.min')}
          min={5}
          max={180}
          step={5}
          onChange={setFocusMinutes}
        />
        <StepperRow
          label={t('taskForm.shortBreak')}
          value={shortBreakMinutes}
          suffix={t('units.min')}
          min={1}
          max={60}
          step={1}
          onChange={setShortBreakMinutes}
        />
        <StepperRow
          label={t('taskForm.longBreak')}
          value={longBreakMinutes}
          suffix={t('units.min')}
          min={5}
          max={120}
          step={5}
          onChange={setLongBreakMinutes}
        />
        <StepperRow
          label={t('taskForm.sessionsBeforeLongBreak')}
          value={sessions}
          suffix={t('units.sessions')}
          min={1}
          max={12}
          step={1}
          onChange={setSessions}
        />
      </SoftCard>

      <SoftCard style={styles.card}>
        <SwitchRow
          label={t('taskForm.autoStartBreaks')}
          helper={t('taskForm.autoStartBreaksHelper')}
          value={autoStartBreaks}
          onValueChange={setAutoStartBreaks}
        />
      </SoftCard>

      <PrimaryButton onPress={handleSubmit}>{submitLabel}</PrimaryButton>
    </View>
  );
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
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.bodyLarge,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundWarm,
  },
  inputError: {
    borderColor: colors.accentDark,
  },
  errorText: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.caption,
  },
});

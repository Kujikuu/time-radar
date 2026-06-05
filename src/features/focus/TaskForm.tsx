import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { PrimaryButton, SegmentedControl, SoftCard } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';

import { FocusCategory, TaskInput } from './types';

type TaskFormProps = {
  initialValue: TaskInput;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void | Promise<void>;
};

const categories: FocusCategory[] = ['Work', 'Study', 'Personal'];

export function TaskForm({ initialValue, submitLabel, onSubmit }: TaskFormProps) {
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
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            accessibilityLabel="Task name"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <SegmentedControl options={categories} value={category} onChange={setCategory} />
        </View>
      </SoftCard>

      <SoftCard style={styles.card}>
        <NumberField label="Focus Duration" value={focusMinutes} onChangeText={setFocusMinutes} />
        <NumberField
          label="Short Break"
          value={shortBreakMinutes}
          onChangeText={setShortBreakMinutes}
        />
        <NumberField
          label="Long Break"
          value={longBreakMinutes}
          onChangeText={setLongBreakMinutes}
        />
        <NumberField label="Sessions Before Long Break" value={sessions} onChangeText={setSessions} />
      </SoftCard>

      <SoftCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>Auto Start Breaks</Text>
            <Text style={styles.helper}>Start break phases automatically after focus.</Text>
          </View>
          <Switch
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
  return (
    <View style={styles.numberRow}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        style={styles.numberInput}
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
});

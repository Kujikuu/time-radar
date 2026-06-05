import { IconFileText, IconPlayerPlay } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, SoftCard } from '@/src/components';
import { textAlignForTextDirection } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, typography } from '@/src/theme';

import { FocusTask } from './types';

type FocusTaskCardProps = {
  task: FocusTask;
};

export function FocusTaskCard({ task }: FocusTaskCardProps) {
  const { direction, formatDuration, t } = useTranslation();
  const contentText = { textAlign: textAlignForTextDirection(direction) };

  return (
    <Pressable
      accessibilityLabel={t('tasks.openTask', {
        values: { title: task.title, minutes: task.focusMinutes },
      })}
      accessibilityRole="button"
      onPress={() => router.push(`/session/${task.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <SoftCard style={styles.card}>
        <View style={styles.iconWrap}>
          <AppIcon icon={IconFileText} size={26} color={colors.accentDark} />
        </View>
        <View style={styles.copy}>
          <AppText style={[styles.title, styles.contentText, contentText]}>{task.title}</AppText>
          <AppText style={[styles.meta, styles.contentText, contentText]}>
            {formatDuration(task.focusMinutes)}
          </AppText>
        </View>
        <View style={styles.playButton}>
          <AppIcon icon={IconPlayerPlay} size={18} color={colors.text} />
        </View>
      </SoftCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.86,
  },
  card: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  contentText: {
    width: '100%',
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});

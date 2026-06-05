import { IconFileText, IconPlayerPlay } from '@tabler/icons-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon, SoftCard } from '@/src/components';
import { colors, radius, typography } from '@/src/theme';

import { FocusTask } from './types';

type FocusTaskCardProps = {
  task: FocusTask;
};

export function FocusTaskCard({ task }: FocusTaskCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/session/${task.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <SoftCard style={styles.card}>
        <View style={styles.iconWrap}>
          <AppIcon icon={IconFileText} size={26} color={colors.accentDark} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.meta}>{task.focusMinutes} min</Text>
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

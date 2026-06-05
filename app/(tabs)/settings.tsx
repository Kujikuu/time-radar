import {
  IconBell,
  IconChevronRight,
  IconClock,
  IconMusic,
  IconUserCircle,
} from '@tabler/icons-react-native';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppIcon, Screen, SoftCard, TablerIcon } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';

const settings: { label: string; value: string; icon: TablerIcon }[] = [
  { label: 'Default focus duration', value: '25 min', icon: IconClock },
  { label: 'Sound', value: 'Soft Bell', icon: IconBell },
  { label: 'Background sound', value: 'None', icon: IconMusic },
];

export default function SettingsScreen() {
  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.iconButton}>
          <AppIcon icon={IconUserCircle} size={26} color={colors.text} />
        </View>
      </View>

      <SoftCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TR</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileTitle}>TimeRadar Setup</Text>
          <Text style={styles.profileText}>Local-first UI shell, ready for SQLite next.</Text>
        </View>
      </SoftCard>

      <SoftCard style={styles.card}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.rowTitle}>Auto Start Breaks</Text>
            <Text style={styles.rowSubtitle}>Start breaks automatically</Text>
          </View>
          <Switch
            value
            trackColor={{ false: colors.borderStrong, true: colors.accentSoft }}
            thumbColor={colors.accent}
          />
        </View>
        {settings.map((item) => (
          <View key={item.label} style={styles.row}>
            <View style={styles.rowLeft}>
              <AppIcon icon={item.icon} size={21} color={colors.accentDark} />
              <Text style={styles.rowTitle}>{item.label}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{item.value}</Text>
              <AppIcon icon={IconChevronRight} size={20} color={colors.text} />
            </View>
          </View>
        ))}
      </SoftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 24,
    fontWeight: '500',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
  },
  avatarText: {
    color: colors.accentDark,
    fontFamily: typography.family,
    fontSize: 18,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 16,
    fontWeight: '700',
  },
  profileText: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  switchRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: 14,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 12,
    marginTop: 3,
  },
  rowValue: {
    color: colors.textMuted,
    fontFamily: typography.family,
    fontSize: 13,
  },
});

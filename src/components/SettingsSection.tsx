import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  rowDirectionForTextDirection,
  textAlignForTextDirection,
} from '@/src/i18n';
import { useTranslation } from '@/src/i18n/LocaleProvider';
import { colors, radius, spacing, typography } from '@/src/theme';

import { AppText } from './AppText';
import { SoftCard } from './SoftCard';

type SettingsSectionProps = {
  title: string;
  badge?: string;
  children: ReactNode;
};

export function SettingsSection({ title, badge, children }: SettingsSectionProps) {
  const { direction, nativeDirection } = useTranslation();
  const tileText = { textAlign: textAlignForTextDirection(direction) };
  const contentRow = { flexDirection: rowDirectionForTextDirection(direction, nativeDirection) };

  return (
    <SoftCard style={styles.card}>
      <View style={[styles.sectionHeader, contentRow]}>
        <View style={styles.sectionTitleWrap}>
          <AppText style={[styles.sectionTitle, styles.tileText, tileText]}>{title}</AppText>
        </View>
        {badge ? <AppText style={styles.badge}>{badge}</AppText> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 32,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },
  tileText: {
    minWidth: 0,
  },
  badge: {
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: radius.pill,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.textMuted,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    backgroundColor: colors.backgroundWarm,
  },
  sectionBody: {
    gap: 0,
  },
});

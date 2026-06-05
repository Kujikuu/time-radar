import { Platform, StyleSheet, Text as NativeText, type TextProps } from 'react-native';

import { fontFamilyForLocale } from '@/src/i18n';
import { useLocale } from '@/src/i18n/LocaleProvider';

export function AppText({ style, ...props }: TextProps) {
  const { direction, locale } = useLocale();
  const flattenedStyle = StyleSheet.flatten(style);
  const textAlign = flattenedStyle?.textAlign ?? 'left';
  const webDirectionProps =
    Platform.OS === 'web' ? ({ dir: direction, lang: locale } as Record<string, string>) : {};

  return (
    <NativeText
      {...webDirectionProps}
      {...props}
      style={[
        style,
        {
          fontFamily: fontFamilyForLocale(locale),
          textAlign,
          writingDirection: direction,
        },
      ]}
    />
  );
}

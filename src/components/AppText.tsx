import { StyleSheet, Text as NativeText, type TextProps } from 'react-native';

import { fontFamilyForLocale, textAlignForTextDirection } from '@/src/i18n';
import { useLocale } from '@/src/i18n/LocaleProvider';

export function AppText({ style, ...props }: TextProps) {
  const { direction, locale } = useLocale();
  const flattenedStyle = StyleSheet.flatten(style);
  const textAlign = flattenedStyle?.textAlign ?? textAlignForTextDirection(direction);
  const webDirectionProps =
    process.env.EXPO_OS === 'web' ? ({ dir: direction, lang: locale } as Record<string, string>) : {};

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

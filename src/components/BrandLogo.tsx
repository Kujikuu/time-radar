import { Image } from 'expo-image';
import { ImageStyle, StyleProp, StyleSheet } from 'react-native';

type BrandLogoProps = {
  variant?: 'hero' | 'header';
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ variant = 'header', style }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="TimeRadar"
      accessible
      contentFit="contain"
      source={require('@/assets/images/timeradar-logo.png')}
      style={[styles.logo, variant === 'hero' ? styles.hero : styles.header, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
  header: {
    width: 168,
    height: 39,
  },
  hero: {
    width: 236,
    height: 55,
  },
});

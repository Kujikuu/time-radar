import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { colors } from '@/src/theme';

export function RadarMark() {
  const rotation = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      rotation.stopAnimation();
      rotation.setValue(0);
      setSweepAngle(0);
      return;
    }

    const sweep = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    sweep.start();

    return () => {
      sweep.stop();
    };
  }, [reduceMotion, rotation]);

  useEffect(() => {
    const listener = rotation.addListener(({ value }) => {
      setSweepAngle(value * 360);
    });

    return () => {
      rotation.removeListener(listener);
    };
  }, [rotation]);

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height="100%" viewBox="0 0 260 260">
        <G transform={`rotate(${sweepAngle} 130 130)`}>
          <Path
            d="M130 130 L211.3 48.7 A115 115 0 0 1 245 130 Z"
            fill={colors.accentSoft}
            opacity="0.58"
          />
        </G>
        {[115, 86, 58, 30].map((ring) => (
          <Circle
            key={ring}
            cx="130"
            cy="130"
            r={ring}
            stroke={colors.accent}
            strokeWidth="1"
            fill="transparent"
            opacity="0.22"
          />
        ))}
        <G transform={`rotate(${sweepAngle} 130 130)`}>
          <Line x1="130" y1="130" x2="211.3" y2="48.7" stroke={colors.white} strokeWidth="7" />
        </G>
        <Circle cx="130" cy="130" r="13" fill={colors.accent} opacity="0.84" />
        <Circle cx="46" cy="207" r="5" fill={colors.accent} opacity="0.34" />
        <Circle cx="222" cy="214" r="5" fill={colors.accent} opacity="0.34" />
        <Circle cx="228" cy="55" r="5" fill={colors.accent} opacity="0.34" />
      </Svg>
      <View style={styles.centerDot}>
        <View style={styles.centerCore} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 270,
    aspectRatio: 1,
    alignSelf: 'center',
  },
  centerDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    opacity: 0.84,
  },
  centerCore: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.accentDark,
    opacity: 0.28,
  },
});

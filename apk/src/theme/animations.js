import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const FadeInView = ({ children, style, duration = 300, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ])
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export const SlideDownView = ({ children, style, duration = 400, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ])
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export const PulseGlowView = ({ children, style }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
  
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    }, []);
  
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    );
  };

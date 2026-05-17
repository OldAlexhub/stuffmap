import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing } from '../theme';
import Logo from '../components/Logo';
import { APP_TAGLINE } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale, textOpacity, taglineOpacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Logo size={120} />
      </Animated.View>
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Stuff<Text style={styles.appNameAccent}>Map</Text>
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        {APP_TAGLINE}
      </Animated.Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>No accounts · No cloud · All yours</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: Spacing.xxl,
    padding: Spacing.xl,
    backgroundColor: Colors.white + '10',
    borderRadius: 40,
  },
  appName: {
    fontSize: Typography.fontSize4XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
    letterSpacing: -1,
  },
  appNameAccent: {
    color: Colors.accent,
  },
  tagline: {
    fontSize: Typography.fontSizeLG,
    color: Colors.white + 'BB',
    marginTop: Spacing.sm,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + '66',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;

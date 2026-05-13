import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const Logo: React.FC<LogoProps> = ({ size = 48, style, imageStyle }) => {
  return (
    <View style={style}>
      <Image
        source={require('../../assets/logo.png')}
        style={[{ width: size, height: size, resizeMode: 'contain' }, imageStyle]}
        accessibilityLabel="StuffMap logo"
      />
    </View>
  );
};

export default Logo;

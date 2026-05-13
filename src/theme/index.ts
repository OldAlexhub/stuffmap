import { StyleSheet } from 'react-native';

export const Colors = {
  // Primary palette (from logo: deep navy + sky blue)
  primary: '#0A2472',
  primaryDark: '#061648',
  primaryLight: '#1A3A8C',
  accent: '#00B4D8',
  accentDark: '#0090AD',
  accentLight: '#48CAE4',

  // Backgrounds
  background: '#F0F7FF',
  backgroundDark: '#070D1A',
  surface: '#FFFFFF',
  surfaceDark: '#0D1F3C',
  cardDark: '#112240',

  // Text
  textPrimary: '#0A2472',
  textPrimaryDark: '#E8F0FF',
  textSecondary: '#4A5568',
  textSecondaryDark: '#8EAABF',
  textMuted: '#94A3B8',
  textMutedDark: '#4A6480',

  // UI
  border: '#D1E3F8',
  borderDark: '#1E3A5F',
  divider: '#EBF4FF',
  dividerDark: '#152D50',

  // Status
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Importance
  importanceLow: '#10B981',
  importanceMedium: '#F59E0B',
  importanceHigh: '#EF4444',

  // Location accent presets
  locationColors: [
    '#0A2472', '#00B4D8', '#10B981', '#F59E0B',
    '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
    '#F97316', '#6366F1', '#84CC16', '#06B6D4',
  ],

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  fontSizeXS: 10,
  fontSizeSM: 12,
  fontSizeMD: 14,
  fontSizeLG: 16,
  fontSizeXL: 18,
  fontSize2XL: 22,
  fontSize3XL: 28,
  fontSize4XL: 34,

  fontWeightLight: '300' as const,
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtraBold: '800' as const,

  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#0A2472',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0A2472',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0A2472',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#0A2472',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const GlobalStyles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});

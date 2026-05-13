import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  dark?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onPress, color, dark = false }) => {
  const bg = color ?? Colors.primary;
  return (
    <TouchableOpacity style={[styles.btn, dark && styles.btnDark, Shadows.sm]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, dark && styles.labelDark]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    margin: Spacing.xs,
  },
  btnDark: {
    backgroundColor: Colors.surfaceDark,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  labelDark: {
    color: Colors.textSecondaryDark,
  },
});

export default QuickActionButton;

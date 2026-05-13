import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
  onPress?: () => void;
  dark?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, onPress, dark = false }) => {
  const bgColor = color ?? Colors.accent;

  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark, Shadows.card]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[styles.iconBadge, { backgroundColor: bgColor + '20' }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.value, dark && styles.valueDark]}>{value}</Text>
      <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    margin: Spacing.xs,
  },
  cardDark: {
    backgroundColor: Colors.surfaceDark,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 22,
  },
  value: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize3XL * 1.1,
  },
  valueDark: {
    color: Colors.textPrimaryDark,
  },
  label: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  labelDark: {
    color: Colors.textMutedDark,
  },
});

export default StatsCard;

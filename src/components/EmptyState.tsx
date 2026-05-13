import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  dark?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📦',
  title,
  subtitle,
  actionLabel,
  onAction,
  dark = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, dark && styles.iconCircleDark]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xxxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircleDark: {
    backgroundColor: Colors.accent + '15',
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  titleDark: {
    color: Colors.textPrimaryDark,
  },
  subtitle: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Typography.fontSizeMD * Typography.lineHeightNormal,
    marginBottom: Spacing.xxl,
  },
  subtitleDark: {
    color: Colors.textMutedDark,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeMD,
  },
});

export default EmptyState;

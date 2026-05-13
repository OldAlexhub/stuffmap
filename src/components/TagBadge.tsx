import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  color?: string;
  dark?: boolean;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove, color, dark = false }) => {
  const accent = color ?? Colors.accent;
  return (
    <View style={[styles.badge, { backgroundColor: accent + '18', borderColor: accent + '40' }, dark && styles.badgeDark]}>
      <Text style={[styles.text, { color: accent }]}>#{tag}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 4, right: 6 }}>
          <Text style={[styles.remove, { color: accent }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badgeDark: {
    borderColor: Colors.accent + '30',
  },
  text: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
  },
  remove: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    marginLeft: 4,
  },
});

export default TagBadge;

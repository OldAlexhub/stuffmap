import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Location } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface LocationCardProps {
  location: Location;
  containerCount: number;
  itemCount: number;
  onPress: () => void;
  dark?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, containerCount, itemCount, onPress, dark = false }) => {
  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark, Shadows.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: location.color + '18' }]}>
        <Text style={styles.icon}>{location.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, dark && styles.nameDark]} numberOfLines={1}>{location.name}</Text>
        {location.description ? (
          <Text style={[styles.description, dark && styles.descriptionDark]} numberOfLines={1}>
            {location.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: location.color + '20' }]}>
            <Text style={[styles.badgeText, { color: location.color }]}>
              {containerCount} {containerCount === 1 ? 'container' : 'containers'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.accent + '18' }]}>
            <Text style={[styles.badgeText, { color: Colors.accent }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.colorBar, { backgroundColor: location.color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: Colors.surfaceDark,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 26,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameDark: {
    color: Colors.textPrimaryDark,
  },
  description: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  descriptionDark: {
    color: Colors.textMutedDark,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
});

export default LocationCard;

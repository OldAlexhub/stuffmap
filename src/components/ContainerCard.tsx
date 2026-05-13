import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Container } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ContainerCardProps {
  container: Container;
  itemCount: number;
  locationColor?: string;
  onPress: () => void;
  dark?: boolean;
}

const ContainerCard: React.FC<ContainerCardProps> = ({ container, itemCount, locationColor, onPress, dark = false }) => {
  const accent = locationColor ?? Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark, Shadows.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {container.photoUri ? (
        <Image source={{ uri: container.photoUri }} style={styles.photo} />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: accent + '15' }]}>
          <Text style={styles.placeholderIcon}>📦</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.name, dark && styles.nameDark]} numberOfLines={1}>{container.name}</Text>
        {container.description ? (
          <Text style={[styles.desc, dark && styles.descDark]} numberOfLines={1}>{container.description}</Text>
        ) : null}
        <View style={styles.bottomRow}>
          <View style={[styles.countBadge, { backgroundColor: accent + '15' }]}>
            <Text style={[styles.countText, { color: accent }]}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          {container.tags.length > 0 && (
            <Text style={[styles.tags, dark && styles.tagsDark]} numberOfLines={1}>
              {container.tags.slice(0, 2).join(' · ')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.card,
  },
  cardDark: {
    backgroundColor: Colors.surfaceDark,
  },
  photo: {
    width: 72,
    height: 72,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  placeholderIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  name: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameDark: {
    color: Colors.textPrimaryDark,
  },
  desc: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  descDark: {
    color: Colors.textMutedDark,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
  },
  tags: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    flex: 1,
  },
  tagsDark: {
    color: Colors.textMutedDark,
  },
});

export default ContainerCard;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Item, Location, Container } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ItemCardProps {
  item: Item;
  location?: Location;
  container?: Container;
  onPress?: () => void;
  showPath?: boolean;
  dark?: boolean;
}

const IMPORTANCE_CONFIG = {
  low:    { color: Colors.importanceLow,    label: 'Low',    dot: '🟢' },
  medium: { color: Colors.importanceMedium, label: 'Medium', dot: '🟡' },
  high:   { color: Colors.importanceHigh,   label: 'High',   dot: '🔴' },
};

const CATEGORY_ICONS: Record<string, string> = {
  'Electronics': '⚡',
  'Clothing': '👕',
  'Tools': '🔧',
  'Documents': '📄',
  'Books & Media': '📚',
  'Kitchen': '🍳',
  'Sports & Outdoor': '⛺',
  'Toys & Games': '🎮',
  'Seasonal': '❄️',
  'Furniture': '🛋️',
  'Cables & Accessories': '🔌',
  'Art & Craft': '🎨',
  'Medical': '💊',
  'Food & Pantry': '🥫',
  'Cleaning': '🧹',
  'Pet Supplies': '🐾',
  'Garden': '🌱',
  'Automotive': '🚗',
  'Miscellaneous': '📦',
};

const ItemCard: React.FC<ItemCardProps> = ({ item, location, container, onPress, showPath = false, dark = false }) => {
  const imp = IMPORTANCE_CONFIG[item.importance] ?? IMPORTANCE_CONFIG.medium;
  const categoryIcon = CATEGORY_ICONS[item.category] ?? '📦';

  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark, Shadows.card]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.leftSection}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.iconBox, { backgroundColor: Colors.primary + '12' }]}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.name, dark && styles.nameDark]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.impBadge, { backgroundColor: imp.color + '18' }]}>
            <Text style={[styles.impText, { color: imp.color }]}>{imp.dot}</Text>
          </View>
        </View>
        {showPath && location && container ? (
          <Text style={[styles.path, dark && styles.pathDark]} numberOfLines={1}>
            {location.icon} {location.name}  ›  {container.name}
          </Text>
        ) : null}
        <View style={styles.bottomRow}>
          <Text style={[styles.meta, dark && styles.metaDark]}>
            {item.category}  ·  Qty: {item.quantity}
          </Text>
          {item.tags.length > 0 && (
            <Text style={[styles.tags, dark && styles.tagsDark]} numberOfLines={1}>
              {item.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
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
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: Colors.surfaceDark,
  },
  leftSection: {
    padding: Spacing.md,
    paddingRight: 0,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 26,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  nameDark: {
    color: Colors.textPrimaryDark,
  },
  impBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  impText: {
    fontSize: 12,
  },
  path: {
    fontSize: Typography.fontSizeXS,
    color: Colors.accent,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: 4,
  },
  pathDark: {
    color: Colors.accentLight,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
  },
  metaDark: {
    color: Colors.textMutedDark,
  },
  tags: {
    fontSize: Typography.fontSizeXS,
    color: Colors.accent,
    fontWeight: Typography.fontWeightMedium,
  },
  tagsDark: {
    color: Colors.accentLight,
  },
});

export default ItemCard;

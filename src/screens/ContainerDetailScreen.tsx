import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ContainerDetail'>;

const ContainerDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { containerId, locationId } = route.params;
  const { state, getContainerById, getLocationById, getItemsForContainer, deleteContainer } = useStorage();
  const dark = state.settings.darkMode;

  const container = getContainerById(containerId);
  const location = getLocationById(locationId);
  const items = useMemo(() => getItemsForContainer(containerId), [containerId, getItemsForContainer]);

  if (!container) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: dark ? Colors.backgroundDark : Colors.background }}>
        <Text style={{ color: dark ? Colors.textPrimaryDark : Colors.textPrimary }}>Container not found.</Text>
      </View>
    );
  }

  const accent = location?.color ?? Colors.primary;

  const handleDeleteContainer = () => {
    Alert.alert(
      'Delete Container',
      `Delete "${container.name}" and all its items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContainer(containerId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const bg = dark ? Colors.backgroundDark : Colors.background;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: accent }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.containerName} numberOfLines={1}>{container.name}</Text>
            {location ? (
              <Text style={styles.locationCrumb}>{location.icon} {location.name}</Text>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('AddEditContainer', { containerId, locationId })}
            >
              <Text style={styles.headerBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleDeleteContainer}>
              <Text style={styles.headerBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        {container.photoUri ? (
          <Image source={{ uri: container.photoUri }} style={styles.containerPhoto} resizeMode="cover" />
        ) : null}
        {container.description ? (
          <Text style={styles.desc}>{container.description}</Text>
        ) : null}
        {container.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {container.tags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.statRow}>
          <Text style={styles.statText}>
            {items.length} {items.length === 1 ? 'item' : 'items'} stored
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            location={location}
            container={container}
            onPress={() => navigation.navigate('AddEditItem', { itemId: item.id, containerId, locationId })}
            dark={dark}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🏷️"
            title="No items here"
            subtitle="Add your first item to this container."
            actionLabel="Add Item"
            onAction={() => navigation.navigate('AddEditItem', { containerId, locationId })}
            dark={dark}
          />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: accent }, Shadows.sm]}
            onPress={() => navigation.navigate('AddEditItem', { containerId, locationId })}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>➕</Text>
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.white, lineHeight: 28 },
  headerCenter: { flex: 1, paddingHorizontal: Spacing.md },
  containerName: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  locationCrumb: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.xs },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: { fontSize: 14 },
  containerPhoto: {
    width: '100%',
    height: 140,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  desc: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + 'CC',
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  tagChip: {
    backgroundColor: Colors.white + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tagText: {
    color: Colors.white,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
  },
  statRow: {
    backgroundColor: Colors.white + '15',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeSM,
  },
  list: { paddingTop: Spacing.xl },
  addBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: { fontSize: 14, marginRight: Spacing.sm },
  addBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeMD,
  },
});

export default ContainerDetailScreen;

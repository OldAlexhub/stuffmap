import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import ContainerCard from '../components/ContainerCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'LocationDetail'>;

const LocationDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { locationId } = route.params;
  const { state, getLocationById, getContainersForLocation, getItemsForContainer, deleteLocation } = useStorage();
  const dark = state.settings.darkMode;

  const location = getLocationById(locationId);
  const containers = useMemo(() => getContainersForLocation(locationId), [locationId, getContainersForLocation]);

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: dark ? Colors.backgroundDark : Colors.background }]}>
        <Text style={{ color: dark ? Colors.textPrimaryDark : Colors.textPrimary, padding: 20 }}>Location not found.</Text>
      </View>
    );
  }

  const totalItems = containers.reduce((sum, c) => sum + getItemsForContainer(c.id).length, 0);

  const handleDelete = () => {
    Alert.alert(
      'Delete Location',
      `Delete "${location.name}" and all its containers and items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLocation(locationId);
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
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: location.color }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.locationIcon}>{location.icon}</Text>
            <Text style={styles.locationName}>{location.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => navigation.navigate('AddEditLocation', { locationId })}
            >
              <Text style={styles.headerBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleDelete}>
              <Text style={styles.headerBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        {location.description ? (
          <Text style={styles.locationDesc}>{location.description}</Text>
        ) : null}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{containers.length}</Text>
            <Text style={styles.statLabel}>Containers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={containers}
        keyExtractor={c => c.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: container }) => (
          <ContainerCard
            container={container}
            itemCount={getItemsForContainer(container.id).length}
            locationColor={location.color}
            onPress={() => navigation.navigate('ContainerDetail', { containerId: container.id, locationId })}
            dark={dark}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="No containers yet"
            subtitle="Add a container to start tracking items inside this location."
            actionLabel="Add Container"
            onAction={() => navigation.navigate('AddEditContainer', { locationId })}
            dark={dark}
          />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: location.color }, Shadows.sm]}
            onPress={() => navigation.navigate('AddEditContainer', { locationId })}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>➕</Text>
            <Text style={styles.addBtnText}>Add Container</Text>
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
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md },
  locationIcon: { fontSize: 28, marginRight: Spacing.sm },
  locationName: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    flex: 1,
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
  locationDesc: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + 'CC',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white + '15',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  statLabel: { fontSize: Typography.fontSizeSM, color: Colors.white + 'BB' },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.white + '40' },
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

export default LocationDetailScreen;

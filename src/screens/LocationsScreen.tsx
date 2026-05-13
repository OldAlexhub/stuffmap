import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import LocationCard from '../components/LocationCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LocationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state } = useStorage();
  const { locations, containers, items, settings } = state;
  const dark = settings.darkMode;

  const locationsWithCounts = useMemo(() => {
    return locations.map(loc => ({
      location: loc,
      containerCount: containers.filter(c => c.locationId === loc.id).length,
      itemCount: items.filter(i => i.locationId === loc.id).length,
    }));
  }, [locations, containers, items]);

  const bg = dark ? Colors.backgroundDark : Colors.background;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Locations</Text>
        <Text style={styles.headerSub}>{locations.length} storage {locations.length === 1 ? 'place' : 'places'}</Text>
      </View>
      <FlatList
        data={locationsWithCounts}
        keyExtractor={item => item.location.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LocationCard
            location={item.location}
            containerCount={item.containerCount}
            itemCount={item.itemCount}
            onPress={() => navigation.navigate('LocationDetail', { locationId: item.location.id })}
            dark={dark}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📍"
            title="No locations yet"
            subtitle="Add your first storage location — garage, closet, office, or anywhere you store things."
            actionLabel="Add Location"
            onAction={() => navigation.navigate('AddEditLocation', {})}
            dark={dark}
          />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.addBtn, Shadows.md]}
            onPress={() => navigation.navigate('AddEditLocation', {})}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>➕</Text>
            <Text style={styles.addBtnText}>Add New Location</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  headerSub: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + 'AA',
    marginTop: 2,
  },
  list: { paddingTop: Spacing.xl },
  addBtn: {
    backgroundColor: Colors.accent,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIcon: { fontSize: 16, marginRight: Spacing.sm },
  addBtnText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeMD,
  },
});

export default LocationsScreen;

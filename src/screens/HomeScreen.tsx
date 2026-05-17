import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import StatsCard from '../components/StatsCard';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import QuickActionButton from '../components/QuickActionButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, getLocationById, getContainerById } = useStorage();
  const { locations, containers, items, settings } = state;
  const dark = settings.darkMode;

  const [searchQuery, setSearchQuery] = React.useState('');

  const recentItems = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [items],
  );

  const topLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => { counts[i.locationId] = (counts[i.locationId] ?? 0) + 1; });
    return locations
      .map(l => ({ location: l, count: counts[l.id] ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [locations, items]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Navigate to Search tab with query
      (navigation as any).navigate('MainTabs', { screen: 'SearchTab', params: { initialQuery: searchQuery } });
    }
  };

  const bg = dark ? Colors.backgroundDark : Colors.background;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerTop}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Stuff<Text style={styles.headerAccent}>Map</Text></Text>
            <Text style={styles.headerSub}>Your offline storage tracker</Text>
          </View>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearchSubmit}
          placeholder="Search your stuff..."
          dark={false}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatsCard label="Locations" value={locations.length} icon="📍" color={Colors.primary} dark={dark} />
          <StatsCard label="Containers" value={containers.length} icon="📦" color={Colors.accent} dark={dark} />
          <StatsCard label="Items" value={items.length} icon="🏷️" color={Colors.success} dark={dark} />
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <QuickActionButton
            icon="➕" label="Add Item"
            color={Colors.accent}
            onPress={() => navigation.navigate('AddEditItem', {})}
            dark={dark}
          />
          <QuickActionButton
            icon="📦" label="Add Container"
            color={Colors.primary}
            onPress={() => navigation.navigate('AddEditContainer', {})}
            dark={dark}
          />
          <QuickActionButton
            icon="📍" label="Add Location"
            color={Colors.success}
            onPress={() => navigation.navigate('AddEditLocation', {})}
            dark={dark}
          />
          <QuickActionButton
            icon="📊" label="Reports"
            color={Colors.warning}
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'ReportsTab' })}
            dark={dark}
          />
        </View>

        {/* Top Locations */}
        {topLocations.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>Top Locations</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topLocationsRow}>
              {topLocations.map(({ location, count }) => (
                <TouchableOpacity
                  key={location.id}
                  style={[styles.topLocCard, { backgroundColor: dark ? Colors.surfaceDark : Colors.surface }, Shadows.sm]}
                  onPress={() => navigation.navigate('LocationDetail', { locationId: location.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.topLocIcon, { backgroundColor: location.color + '20' }]}>
                    <Text style={styles.topLocIconText}>{location.icon}</Text>
                  </View>
                  <Text style={[styles.topLocName, dark && styles.topLocNameDark]} numberOfLines={1}>{location.name}</Text>
                  <Text style={[styles.topLocCount, { color: location.color }]}>{count} items</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Recent Items */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>Recently Added</Text>
          {items.length > 5 && (
            <TouchableOpacity onPress={() => (navigation as any).navigate('MainTabs', { screen: 'SearchTab' })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentItems.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No items yet"
            subtitle="Start by adding a location, then a container, then your first item."
            actionLabel="Add your first item"
            onAction={() => navigation.navigate('AddEditItem', {})}
            dark={dark}
          />
        ) : (
          recentItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              location={getLocationById(item.locationId)}
              container={getContainerById(item.containerId)}
              showPath
              onPress={() => navigation.navigate('AddEditItem', { itemId: item.id })}
              dark={dark}
            />
          ))
        )}
      </ScrollView>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLogo: {
    width: 44,
    height: 44,
    marginRight: Spacing.md,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  headerAccent: { color: Colors.accent },
  headerSub: {
    fontSize: Typography.fontSizeSM,
    color: Colors.white + 'AA',
    marginTop: 1,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.xl },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  sectionTitleDark: { color: Colors.textPrimaryDark },
  seeAll: {
    fontSize: Typography.fontSizeSM,
    color: Colors.accent,
    fontWeight: Typography.fontWeightSemiBold,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  topLocationsRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  topLocCard: {
    width: 120,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  topLocIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  topLocIconText: { fontSize: 22 },
  topLocName: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  topLocNameDark: { color: Colors.textPrimaryDark },
  topLocCount: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    marginTop: 2,
  },
});

export default HomeScreen;

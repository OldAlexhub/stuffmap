import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing } from '../theme';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, getLocationById, getContainerById } = useStorage();
  const { items, settings } = state;
  const dark = settings.darkMode;

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items
      .filter(item => {
        const loc = getLocationById(item.locationId);
        const con = getContainerById(item.containerId);
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          (item.notes?.toLowerCase().includes(q)) ||
          (loc?.name.toLowerCase().includes(q)) ||
          (con?.name.toLowerCase().includes(q))
        );
      })
      .map(item => ({
        item,
        location: getLocationById(item.locationId),
        container: getContainerById(item.containerId),
      }));
  }, [query, items, getLocationById, getContainerById]);

  const bg = dark ? Colors.backgroundDark : Colors.background;

  const renderHeader = () => (
    <View>
      {query.length > 0 && (
        <Text style={[styles.resultCount, dark && styles.resultCountDark]}>
          {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
        </Text>
      )}
      {query.length === 0 && (
        <View style={styles.hints}>
          <Text style={[styles.hintsTitle, dark && styles.hintsTitleDark]}>Search by:</Text>
          {['Item name', 'Container name', 'Location name', 'Category', 'Tag', 'Notes'].map(hint => (
            <View key={hint} style={styles.hintRow}>
              <Text style={styles.hintDot}>·</Text>
              <Text style={[styles.hintText, dark && styles.hintTextDark]}>{hint}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Search</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
          dark={false}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={r => r.item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item: result }) => (
          <ItemCard
            item={result.item}
            location={result.location}
            container={result.container}
            showPath
            onPress={() =>
              navigation.navigate('AddEditItem', {
                itemId: result.item.id,
                containerId: result.item.containerId,
                locationId: result.item.locationId,
              })
            }
            dark={dark}
          />
        )}
        ListEmptyComponent={
          query.length > 0 ? (
            <EmptyState
              icon="🔍"
              title="Nothing found"
              subtitle={`No items match "${query}". Try a different keyword.`}
              dark={dark}
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  list: { paddingTop: Spacing.lg },
  resultCount: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultCountDark: { color: Colors.textMutedDark },
  hints: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  hintsTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  hintsTitleDark: { color: Colors.textSecondaryDark },
  hintRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  hintDot: { fontSize: 20, color: Colors.accent, marginRight: Spacing.sm, lineHeight: 20 },
  hintText: { fontSize: Typography.fontSizeMD, color: Colors.textMuted },
  hintTextDark: { color: Colors.textMutedDark },
});

export default SearchScreen;

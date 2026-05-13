import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, StatusBar, ActivityIndicator, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import { Share } from 'react-native';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { generateCSV, generateJSON, generateHTMLReport } from '../services/exportService';
import { APP_NAME } from '../constants';

const ReportsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { state } = useStorage();
  const { locations, containers, items, settings } = state;
  const dark = settings.darkMode;

  const [filterLocationId, setFilterLocationId] = useState<string>('');
  const [includeNotes, setIncludeNotes] = useState(settings.exportIncludeNotes);
  const [exporting, setExporting] = useState<'csv' | 'json' | 'html' | null>(null);
  const [showLocFilter, setShowLocFilter] = useState(false);

  const filteredItems = filterLocationId
    ? items.filter(i => i.locationId === filterLocationId)
    : items;
  const filteredContainers = filterLocationId
    ? containers.filter(c => c.locationId === filterLocationId)
    : containers;
  const filteredLocations = filterLocationId
    ? locations.filter(l => l.id === filterLocationId)
    : locations;

  const selectedLocation = filterLocationId ? locations.find(l => l.id === filterLocationId) : undefined;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const suffix = selectedLocation ? `-${selectedLocation.name.replace(/\s/g, '_')}` : '';

  const exportCSV = async () => {
    setExporting('csv');
    try {
      const csv = generateCSV(filteredLocations, filteredContainers, filteredItems, { includeNotes });
      const filename = `StuffMap-Report${suffix}-${timestamp}.csv`;
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, csv, 'utf8');

      // Try to save to Downloads
      try {
        const dlPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
        await RNFS.copyFile(path, dlPath);
        Alert.alert('CSV Saved', `Report saved to:\nDownloads/${filename}`, [
          { text: 'Also Share', onPress: () => Share.share({ title: `${APP_NAME} Report`, message: csv }) },
          { text: 'OK' },
        ]);
      } catch {
        await Share.share({ title: `${APP_NAME} CSV Report`, message: csv });
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Could not export CSV.');
    } finally {
      setExporting(null);
    }
  };

  const exportJSON = async () => {
    setExporting('json');
    try {
      const json = generateJSON(filteredLocations, filteredContainers, filteredItems, settings);
      const filename = `StuffMap-Backup${suffix}-${timestamp}.json`;
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, json, 'utf8');
      try {
        const dlPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
        await RNFS.copyFile(path, dlPath);
        Alert.alert('JSON Saved', `Backup saved to:\nDownloads/${filename}`, [
          { text: 'Also Share', onPress: () => Share.share({ title: `${APP_NAME} Backup`, message: json }) },
          { text: 'OK' },
        ]);
      } catch {
        await Share.share({ title: `${APP_NAME} JSON Backup`, message: json });
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Could not export JSON.');
    } finally {
      setExporting(null);
    }
  };

  const exportHTML = async () => {
    setExporting('html');
    try {
      const html = generateHTMLReport(filteredLocations, filteredContainers, filteredItems, {
        includeNotes,
        filterLocationId,
      });
      const filename = `StuffMap-Report${suffix}-${timestamp}.html`;
      const path = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, html, 'utf8');
      try {
        const dlPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
        await RNFS.copyFile(path, dlPath);
        Alert.alert('HTML Report Saved', `Report saved to:\nDownloads/${filename}\n\nOpen in a browser to print or save as PDF.`, [
          { text: 'Also Share', onPress: () => Share.share({ title: `${APP_NAME} Report`, message: html }) },
          { text: 'OK' },
        ]);
      } catch {
        await Share.share({ title: `${APP_NAME} HTML Report`, message: html });
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e?.message ?? 'Could not export HTML.');
    } finally {
      setExporting(null);
    }
  };

  const bg = dark ? Colors.backgroundDark : Colors.background;
  const cardBg = dark ? Colors.surfaceDark : Colors.surface;

  const renderExportBtn = (
    label: string,
    icon: string,
    desc: string,
    color: string,
    onPress: () => void,
    type: 'csv' | 'json' | 'html',
  ) => (
    <TouchableOpacity
      style={[styles.exportBtn, { backgroundColor: cardBg }, Shadows.card]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={exporting !== null}
    >
      <View style={[styles.exportIcon, { backgroundColor: color + '18' }]}>
        {exporting === type ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <Text style={styles.exportIconText}>{icon}</Text>
        )}
      </View>
      <View style={styles.exportText}>
        <Text style={[styles.exportLabel, dark && styles.exportLabelDark]}>{label}</Text>
        <Text style={[styles.exportDesc, dark && styles.exportDescDark]}>{desc}</Text>
      </View>
      <Text style={[styles.exportArrow, { color }]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>Export your inventory</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: cardBg }, Shadows.card]}>
          <Text style={[styles.sectionTitle, dark && styles.sectionTitleDark]}>Summary</Text>
          <View style={styles.summaryRow}>
            {[
              { label: 'Locations', value: filteredLocations.length, color: Colors.primary },
              { label: 'Containers', value: filteredContainers.length, color: Colors.accent },
              { label: 'Items', value: filteredItems.length, color: Colors.success },
            ].map(s => (
              <View key={s.label} style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.summaryLabel, dark && styles.summaryLabelDark]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filters */}
        <Text style={[styles.sectionLabel, dark && styles.sectionLabelDark]}>Filters</Text>
        <View style={[styles.filterCard, { backgroundColor: cardBg }, Shadows.sm]}>
          {/* Location filter */}
          <TouchableOpacity
            style={styles.filterRow}
            onPress={() => setShowLocFilter(!showLocFilter)}
          >
            <Text style={[styles.filterLabel, dark && styles.filterLabelDark]}>Location filter</Text>
            <Text style={[styles.filterValue, { color: Colors.accent }]}>
              {selectedLocation ? `${selectedLocation.icon} ${selectedLocation.name}` : 'All locations'}
            </Text>
            <Text style={styles.filterArrow}>{showLocFilter ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showLocFilter && (
            <View style={styles.filterDropdown}>
              <TouchableOpacity
                style={[styles.filterOption, !filterLocationId && { backgroundColor: Colors.accent + '18' }]}
                onPress={() => { setFilterLocationId(''); setShowLocFilter(false); }}
              >
                <Text style={[styles.filterOptionText, dark && styles.filterOptionTextDark]}>All locations</Text>
                {!filterLocationId && <Text style={{ color: Colors.accent }}>✓</Text>}
              </TouchableOpacity>
              {locations.map(loc => (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.filterOption, filterLocationId === loc.id && { backgroundColor: loc.color + '18' }]}
                  onPress={() => { setFilterLocationId(loc.id); setShowLocFilter(false); }}
                >
                  <Text style={styles.filterOptionIcon}>{loc.icon}</Text>
                  <Text style={[styles.filterOptionText, dark && styles.filterOptionTextDark]}>{loc.name}</Text>
                  {filterLocationId === loc.id && <Text style={{ color: loc.color }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Include notes toggle */}
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, dark && styles.filterLabelDark]}>Include notes</Text>
            <Switch
              value={includeNotes}
              onValueChange={setIncludeNotes}
              trackColor={{ false: Colors.border, true: Colors.accent + '80' }}
              thumbColor={includeNotes ? Colors.accent : Colors.textMuted}
            />
          </View>
        </View>

        {/* Export options */}
        <Text style={[styles.sectionLabel, dark && styles.sectionLabelDark]}>Export Format</Text>

        {renderExportBtn(
          'CSV Spreadsheet',
          '📊',
          'Open in Excel, Google Sheets, Numbers',
          Colors.success,
          exportCSV,
          'csv',
        )}
        {renderExportBtn(
          'HTML Report',
          '🌐',
          'Beautiful report — print or save as PDF in browser',
          Colors.accent,
          exportHTML,
          'html',
        )}
        {renderExportBtn(
          'JSON Backup',
          '💾',
          'Full data backup — can be re-imported later',
          Colors.primary,
          exportJSON,
          'json',
        )}

        <View style={styles.note}>
          <Text style={[styles.noteText, dark && styles.noteTextDark]}>
            📁 Files are saved to your Downloads folder and can also be shared via any app.
          </Text>
        </View>
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
  headerTitle: {
    fontSize: Typography.fontSize3XL,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.white,
  },
  headerSub: { fontSize: Typography.fontSizeSM, color: Colors.white + 'AA', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.xl },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  sectionTitleDark: { color: Colors.textSecondaryDark },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: Typography.fontSize3XL, fontWeight: Typography.fontWeightExtraBold },
  summaryLabel: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2 },
  summaryLabelDark: { color: Colors.textMutedDark },
  sectionLabel: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLabelDark: { color: Colors.textSecondaryDark },
  filterCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterLabel: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightMedium,
  },
  filterLabelDark: { color: Colors.textPrimaryDark },
  filterValue: { fontSize: Typography.fontSizeSM, marginRight: Spacing.sm },
  filterArrow: { color: Colors.textMuted, fontSize: 12 },
  filterDropdown: { backgroundColor: Colors.background + '80' },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterOptionIcon: { fontSize: 16, marginRight: Spacing.sm },
  filterOptionText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.textPrimary },
  filterOptionTextDark: { color: Colors.textPrimaryDark },
  exportBtn: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exportIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exportIconText: { fontSize: 24 },
  exportText: { flex: 1 },
  exportLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exportLabelDark: { color: Colors.textPrimaryDark },
  exportDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
  exportDescDark: { color: Colors.textMutedDark },
  exportArrow: { fontSize: 20, fontWeight: '700' },
  note: {
    backgroundColor: Colors.infoBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  noteText: { fontSize: Typography.fontSizeSM, color: Colors.textSecondary, lineHeight: 20 },
  noteTextDark: { color: Colors.textSecondaryDark },
});

export default ReportsScreen;

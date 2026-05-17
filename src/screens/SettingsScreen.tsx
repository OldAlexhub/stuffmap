import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import { Share } from 'react-native';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { APP_VERSION, APP_NAME } from '../constants';
import { generateJSON } from '../services/exportService';
import { clearAllData } from '../storage/database';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { state, updateSettings, reloadAll } = useStorage();
  const { settings } = state;
  const dark = settings.darkMode;
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const bg = dark ? Colors.backgroundDark : Colors.background;
  const cardBg = dark ? Colors.surfaceDark : Colors.surface;

  const handleToggleDark = async (val: boolean) => {
    await updateSettings({ darkMode: val });
  };

  const handleToggleNotes = async (val: boolean) => {
    await updateSettings({ exportIncludeNotes: val });
  };

  const handleBackupNow = async () => {
    setExporting(true);
    try {
      const json = generateJSON(state.locations, state.containers, state.items, settings);
      const filename = `StuffMap-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      try {
        const dlPath = `${RNFS.DownloadDirectoryPath}/${filename}`;
        await RNFS.writeFile(dlPath, json, 'utf8');
        await updateSettings({ lastBackupDate: new Date().toISOString() });
        Alert.alert('Backup Saved', `Saved to Downloads/${filename}`);
      } catch {
        await Share.share({ title: `${APP_NAME} Backup`, message: json });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Backup failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL your locations, containers, and items. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await clearAllData();
              await reloadAll();
              Alert.alert('Done', 'All data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear data.');
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  const Section = ({ title }: { title: string }) => (
    <Text style={[styles.sectionLabel, dark && styles.sectionLabelDark]}>{title}</Text>
  );

  const SettingRow = ({
    label,
    value,
    onToggle,
    desc,
  }: {
    label: string;
    value: boolean;
    onToggle: (v: boolean) => void;
    desc?: string;
  }) => (
    <View style={[styles.settingRow, { backgroundColor: cardBg }]}>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingLabel, dark && styles.settingLabelDark]}>{label}</Text>
        {desc ? <Text style={[styles.settingDesc, dark && styles.settingDescDark]}>{desc}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.accent + '80' }}
        thumbColor={value ? Colors.accent : Colors.textMuted}
      />
    </View>
  );

  const ActionRow = ({
    label,
    icon,
    desc,
    color,
    onPress,
    disabled,
  }: {
    label: string;
    icon: string;
    desc?: string;
    color?: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionRow, { backgroundColor: cardBg }, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionTextWrap}>
        <Text style={[styles.actionLabel, color ? { color } : dark && styles.actionLabelDark]}>{label}</Text>
        {desc ? <Text style={[styles.actionDesc, dark && styles.actionDescDark]}>{desc}</Text> : null}
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Appearance" />
        <SettingRow
          label="Dark Mode"
          value={settings.darkMode}
          onToggle={handleToggleDark}
          desc="Switch to dark theme"
        />

        <Section title="Export Defaults" />
        <SettingRow
          label="Include Notes in Exports"
          value={settings.exportIncludeNotes}
          onToggle={handleToggleNotes}
          desc="Add notes column to CSV/HTML exports"
        />

        <Section title="Data" />
        <ActionRow
          label="Backup to Downloads"
          icon="💾"
          desc={settings.lastBackupDate
            ? `Last backup: ${new Date(settings.lastBackupDate).toLocaleDateString()}`
            : 'No backups yet'}
          onPress={handleBackupNow}
          disabled={exporting}
        />
        <ActionRow
          label="Clear All Data"
          icon="🗑️"
          desc="Permanently delete everything"
          color={Colors.error}
          onPress={handleClearData}
          disabled={clearing}
        />

        <Section title="About" />
        <ActionRow
          label="About & Privacy"
          icon="ℹ️"
          desc="No cloud, no tracking, fully offline"
          onPress={() => navigation.navigate('About')}
        />

        {/* Version info */}
        <View style={styles.versionWrap}>
          <Text style={[styles.version, dark && styles.versionDark]}>{APP_NAME} v{APP_VERSION}</Text>
          <Text style={[styles.versionSub, dark && styles.versionSubDark]}>
            {state.locations.length} locations · {state.containers.length} containers · {state.items.length} items
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.xl },
  sectionLabel: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  sectionLabelDark: { color: Colors.textSecondaryDark },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
    ...Shadows.sm,
  },
  settingTextWrap: { flex: 1 },
  settingLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  settingLabelDark: { color: Colors.textPrimaryDark },
  settingDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2 },
  settingDescDark: { color: Colors.textMutedDark },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
    ...Shadows.sm,
  },
  actionIcon: { fontSize: 22, marginRight: Spacing.md },
  actionTextWrap: { flex: 1 },
  actionLabel: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
  },
  actionLabelDark: { color: Colors.textPrimaryDark },
  actionDesc: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginTop: 2 },
  actionDescDark: { color: Colors.textMutedDark },
  actionArrow: { fontSize: 20, color: Colors.textMuted },
  versionWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  version: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textMuted,
  },
  versionDark: { color: Colors.textMutedDark },
  versionSub: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 4,
  },
  versionSubDark: { color: Colors.textMutedDark },
});

export default SettingsScreen;

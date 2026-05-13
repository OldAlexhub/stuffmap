import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { LOCATION_ICONS } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEditLocation'>;

const COLOR_PRESETS = Colors.locationColors;

const AddEditLocationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const locationId = route.params?.locationId;
  const { state, getLocationById, addLocation, updateLocation } = useStorage();
  const dark = state.settings.darkMode;

  const existing = locationId ? getLocationById(locationId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [selectedIcon, setSelectedIcon] = useState(existing?.icon ?? '🏠');
  const [selectedColor, setSelectedColor] = useState(existing?.color ?? COLOR_PRESETS[0]);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(existing);
  const bg = dark ? Colors.backgroundDark : Colors.background;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a location name.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && locationId) {
        await updateLocation(locationId, {
          name: name.trim(),
          description: description.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
        });
      } else {
        await addLocation({
          name: name.trim(),
          description: description.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: bg }]}>
        <StatusBar backgroundColor={selectedColor} barStyle="light-content" />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: selectedColor }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Location' : 'New Location'}</Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          {/* Preview */}
          <View style={styles.preview}>
            <Text style={styles.previewIcon}>{selectedIcon}</Text>
            <Text style={styles.previewName} numberOfLines={1}>
              {name || 'Location Name'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <Text style={[styles.label, dark && styles.labelDark]}>Name *</Text>
          <TextInput
            style={[styles.input, dark && styles.inputDark]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Garage, Bedroom Closet"
            placeholderTextColor={Colors.textMuted}
            maxLength={60}
            autoCapitalize="words"
          />

          {/* Description */}
          <Text style={[styles.label, dark && styles.labelDark]}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti, dark && styles.inputDark]}
            value={description}
            onChangeText={setDescription}
            placeholder="What do you store here?"
            placeholderTextColor={Colors.textMuted}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Icon picker */}
          <Text style={[styles.label, dark && styles.labelDark]}>Icon</Text>
          <View style={styles.iconGrid}>
            {LOCATION_ICONS.map(({ icon }) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  dark && styles.iconOptionDark,
                  selectedIcon === icon && { borderColor: selectedColor, borderWidth: 2, backgroundColor: selectedColor + '15' },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconOptionText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color picker */}
          <Text style={[styles.label, dark && styles.labelDark]}>Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_PRESETS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Text style={styles.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 14, color: Colors.white, fontWeight: '700' },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.white + '25',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveBtnText: { color: Colors.white, fontWeight: Typography.fontWeightBold, fontSize: Typography.fontSizeMD },
  preview: { alignItems: 'center' },
  previewIcon: { fontSize: 48, marginBottom: Spacing.sm },
  previewName: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.xl },
  label: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelDark: { color: Colors.textSecondaryDark },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeMD,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputDark: {
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderDark,
    color: Colors.textPrimaryDark,
  },
  inputMulti: { height: 80, paddingTop: Spacing.md },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.xs / 2,
  },
  iconOptionDark: {
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderDark,
  },
  iconOptionText: { fontSize: 24 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: Spacing.xs / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.md,
  },
  colorCheck: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});

export default AddEditLocationScreen;

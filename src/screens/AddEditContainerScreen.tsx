import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, StatusBar, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import TagBadge from '../components/TagBadge';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEditContainer'>;

const AddEditContainerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const containerId = route.params?.containerId;
  const presetLocationId = route.params?.locationId;

  const { state, getContainerById, getLocationById, addContainer, updateContainer } = useStorage();
  const dark = state.settings.darkMode;

  const existing = containerId ? getContainerById(containerId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [locationId, setLocationId] = useState(existing?.locationId ?? presetLocationId ?? '');
  const [photoUri, setPhotoUri] = useState(existing?.photoUri ?? '');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const isEdit = Boolean(existing);
  const bg = dark ? Colors.backgroundDark : Colors.background;
  const selectedLocation = locationId ? getLocationById(locationId) : undefined;

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name Required', 'Please enter a container name.'); return; }
    if (!locationId) { Alert.alert('Location Required', 'Please select a location.'); return; }
    setSaving(true);
    try {
      if (isEdit && containerId) {
        await updateContainer(containerId, {
          name: name.trim(),
          description: description.trim() || undefined,
          locationId,
          photoUri: photoUri || undefined,
          tags,
        });
      } else {
        await addContainer({
          name: name.trim(),
          description: description.trim() || undefined,
          locationId,
          photoUri: photoUri || undefined,
          tags,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save container.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: bg }]}>
        <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Container' : 'New Container'}</Text>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Location */}
          <Text style={[styles.label, dark && styles.labelDark]}>Location *</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, dark && styles.inputDark]}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={[styles.pickerText, dark && styles.pickerTextDark, !selectedLocation && { color: Colors.textMuted }]}>
              {selectedLocation ? `${selectedLocation.icon} ${selectedLocation.name}` : 'Select a location...'}
            </Text>
            <Text style={styles.pickerArrow}>{showLocationPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showLocationPicker && (
            <View style={[styles.pickerDropdown, dark && styles.pickerDropdownDark]}>
              {state.locations.length === 0 ? (
                <Text style={[styles.pickerEmpty, dark && styles.pickerEmptyDark]}>
                  No locations yet. Add a location first.
                </Text>
              ) : (
                state.locations.map(loc => (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.pickerItem, locationId === loc.id && { backgroundColor: loc.color + '20' }]}
                    onPress={() => { setLocationId(loc.id); setShowLocationPicker(false); }}
                  >
                    <Text style={styles.pickerItemIcon}>{loc.icon}</Text>
                    <Text style={[styles.pickerItemText, dark && styles.pickerItemTextDark]}>{loc.name}</Text>
                    {locationId === loc.id && <Text style={{ color: loc.color }}>✓</Text>}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Name */}
          <Text style={[styles.label, dark && styles.labelDark]}>Container Name *</Text>
          <TextInput
            style={[styles.input, dark && styles.inputDark]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Blue Bin, Shelf 2, Box A"
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
            placeholder="What's inside, size, color..."
            placeholderTextColor={Colors.textMuted}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Photo */}
          <Text style={[styles.label, dark && styles.labelDark]}>Photo (optional)</Text>
          <TouchableOpacity style={[styles.photoBtn, dark && styles.photoBtnDark]} onPress={handlePickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoBtnIcon}>📷</Text>
                <Text style={[styles.photoBtnText, dark && styles.photoBtnTextDark]}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {photoUri ? (
            <TouchableOpacity onPress={() => setPhotoUri('')} style={styles.removePhotoBtn}>
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
          ) : null}

          {/* Tags */}
          <Text style={[styles.label, dark && styles.labelDark]}>Tags (optional)</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput, dark && styles.inputDark]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag..."
              placeholderTextColor={Colors.textMuted}
              maxLength={30}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map(tag => (
                <TagBadge key={tag} tag={tag} onRemove={() => setTags(tags.filter(t => t !== tag))} dark={dark} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
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
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveBtnText: { color: Colors.white, fontWeight: Typography.fontWeightBold },
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
  pickerInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: Typography.fontSizeMD, color: Colors.textPrimary, flex: 1 },
  pickerTextDark: { color: Colors.textPrimaryDark },
  pickerArrow: { color: Colors.textMuted, fontSize: 12 },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  pickerDropdownDark: { backgroundColor: Colors.surfaceDark, borderColor: Colors.borderDark },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerItemIcon: { fontSize: 20, marginRight: Spacing.sm },
  pickerItemText: { flex: 1, fontSize: Typography.fontSizeMD, color: Colors.textPrimary },
  pickerItemTextDark: { color: Colors.textPrimaryDark },
  pickerEmpty: { padding: Spacing.lg, color: Colors.textMuted, textAlign: 'center' },
  pickerEmptyDark: { color: Colors.textMutedDark },
  photoBtn: {
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  photoBtnDark: { borderColor: Colors.borderDark },
  photoPreview: { width: '100%', height: 160 },
  photoPlaceholder: { height: 100, alignItems: 'center', justifyContent: 'center' },
  photoBtnIcon: { fontSize: 28, marginBottom: Spacing.xs },
  photoBtnText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
  photoBtnTextDark: { color: Colors.textMutedDark },
  removePhotoBtn: { alignItems: 'center', marginBottom: Spacing.sm },
  removePhotoText: { color: Colors.error, fontSize: Typography.fontSizeSM },
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm },
  tagInput: { flex: 1, marginBottom: 0 },
  addTagBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagBtnText: { color: Colors.white, fontWeight: Typography.fontWeightBold },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, marginBottom: Spacing.sm },
});

export default AddEditContainerScreen;

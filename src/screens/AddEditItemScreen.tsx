import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList, ImportanceLevel } from '../types';
import { useStorage } from '../storage/StorageContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { ITEM_CATEGORIES } from '../constants';
import TagBadge from '../components/TagBadge';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEditItem'>;

const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string; color: string; icon: string }[] = [
  { value: 'low',    label: 'Low',    color: Colors.importanceLow,    icon: '🟢' },
  { value: 'medium', label: 'Medium', color: Colors.importanceMedium, icon: '🟡' },
  { value: 'high',   label: 'High',   color: Colors.importanceHigh,   icon: '🔴' },
];

const AddEditItemScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const itemId         = route.params?.itemId;
  const preContainerId = route.params?.containerId;
  const preLocationId  = route.params?.locationId;

  const { state, getItemById, getLocationById, getContainerById, addItem, updateItem, deleteItem } = useStorage();
  const dark = state.settings.darkMode;

  const existing = itemId ? getItemById(itemId) : undefined;

  const [name, setName]         = useState(existing?.name ?? '');
  const [locationId, setLocationId] = useState(existing?.locationId ?? preLocationId ?? '');
  const [containerId, setContainerId] = useState(existing?.containerId ?? preContainerId ?? '');
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1));
  const [category, setCategory] = useState(existing?.category ?? ITEM_CATEGORIES[0]);
  const [importance, setImportance] = useState<ImportanceLevel>(existing?.importance ?? 'medium');
  const [notes, setNotes]       = useState(existing?.notes ?? '');
  const [photoUri, setPhotoUri] = useState(existing?.photoUri ?? '');
  const [tags, setTags]         = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving]     = useState(false);
  const [showLocPicker, setShowLocPicker]   = useState(false);
  const [showConPicker, setShowConPicker]   = useState(false);
  const [showCatPicker, setShowCatPicker]   = useState(false);

  const isEdit = Boolean(existing);
  const bg = dark ? Colors.backgroundDark : Colors.background;

  const selectedLocation  = locationId ? getLocationById(locationId) : undefined;
  const selectedContainer = containerId ? getContainerById(containerId) : undefined;
  const availableContainers = state.containers.filter(c => c.locationId === locationId);

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets?.[0]?.uri) setPhotoUri(result.assets[0].uri);
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name Required', 'Please enter an item name.'); return; }
    if (!locationId)  { Alert.alert('Location Required', 'Please select a location.'); return; }
    if (!containerId) { Alert.alert('Container Required', 'Please select a container.'); return; }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) { Alert.alert('Invalid Quantity', 'Quantity must be at least 1.'); return; }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        locationId,
        containerId,
        quantity: qty,
        category,
        importance,
        notes: notes.trim() || undefined,
        photoUri: photoUri || undefined,
        tags,
      };
      if (isEdit && itemId) {
        await updateItem(itemId, data);
      } else {
        await addItem(data);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Item', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (itemId) { await deleteItem(itemId); navigation.goBack(); }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? 'Edit Item' : 'New Item'}</Text>
            <View style={styles.headerRight}>
              {isEdit && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? '...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item Name */}
          <Text style={[styles.label, dark && styles.labelDark]}>Item Name *</Text>
          <TextInput
            style={[styles.input, dark && styles.inputDark]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. HDMI Cable, Winter Jacket, Drill"
            placeholderTextColor={Colors.textMuted}
            maxLength={100}
            autoCapitalize="words"
          />

          {/* Location */}
          <Text style={[styles.label, dark && styles.labelDark]}>Location *</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, dark && styles.inputDark]}
            onPress={() => { setShowLocPicker(!showLocPicker); setShowConPicker(false); }}
          >
            <Text style={[styles.pickerText, dark && styles.pickerTextDark, !selectedLocation && { color: Colors.textMuted }]}>
              {selectedLocation ? `${selectedLocation.icon} ${selectedLocation.name}` : 'Select location...'}
            </Text>
            <Text style={styles.arrow}>{showLocPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showLocPicker && (
            <View style={[styles.dropdown, dark && styles.dropdownDark]}>
              {state.locations.map(loc => (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.dropdownItem, locationId === loc.id && { backgroundColor: loc.color + '18' }]}
                  onPress={() => {
                    setLocationId(loc.id);
                    setContainerId('');
                    setShowLocPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemIcon}>{loc.icon}</Text>
                  <Text style={[styles.dropdownItemText, dark && styles.dropdownItemTextDark]}>{loc.name}</Text>
                  {locationId === loc.id && <Text style={{ color: loc.color }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Container */}
          <Text style={[styles.label, dark && styles.labelDark]}>Container *</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, dark && styles.inputDark, !locationId && { opacity: 0.5 }]}
            onPress={() => { if (locationId) { setShowConPicker(!showConPicker); setShowLocPicker(false); } }}
          >
            <Text style={[styles.pickerText, dark && styles.pickerTextDark, !selectedContainer && { color: Colors.textMuted }]}>
              {selectedContainer ? `📦 ${selectedContainer.name}` : (locationId ? 'Select container...' : 'Select a location first')}
            </Text>
            <Text style={styles.arrow}>{showConPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showConPicker && (
            <View style={[styles.dropdown, dark && styles.dropdownDark]}>
              {availableContainers.length === 0 ? (
                <Text style={[styles.dropdownEmpty, dark && styles.dropdownEmptyDark]}>No containers in this location yet.</Text>
              ) : (
                availableContainers.map(con => (
                  <TouchableOpacity
                    key={con.id}
                    style={[styles.dropdownItem, containerId === con.id && { backgroundColor: Colors.accent + '18' }]}
                    onPress={() => { setContainerId(con.id); setShowConPicker(false); }}
                  >
                    <Text style={styles.dropdownItemIcon}>📦</Text>
                    <Text style={[styles.dropdownItemText, dark && styles.dropdownItemTextDark]}>{con.name}</Text>
                    {containerId === con.id && <Text style={{ color: Colors.accent }}>✓</Text>}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Quantity */}
          <Text style={[styles.label, dark && styles.labelDark]}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(String(Math.max(1, parseInt(quantity, 10) - 1)))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.qtyInput, dark && styles.inputDark]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              maxLength={5}
            />
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(String(parseInt(quantity, 10) + 1))}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={[styles.label, dark && styles.labelDark]}>Category</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, dark && styles.inputDark]}
            onPress={() => setShowCatPicker(!showCatPicker)}
          >
            <Text style={[styles.pickerText, dark && styles.pickerTextDark]}>{category}</Text>
            <Text style={styles.arrow}>{showCatPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCatPicker && (
            <View style={[styles.dropdown, styles.catDropdown, dark && styles.dropdownDark]}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                {ITEM_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.dropdownItem, category === cat && { backgroundColor: Colors.accent + '18' }]}
                    onPress={() => { setCategory(cat); setShowCatPicker(false); }}
                  >
                    <Text style={[styles.dropdownItemText, dark && styles.dropdownItemTextDark]}>{cat}</Text>
                    {category === cat && <Text style={{ color: Colors.accent }}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Importance */}
          <Text style={[styles.label, dark && styles.labelDark]}>Importance</Text>
          <View style={styles.importanceRow}>
            {IMPORTANCE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.impOption,
                  dark && styles.impOptionDark,
                  importance === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '18' },
                ]}
                onPress={() => setImportance(opt.value)}
              >
                <Text style={styles.impIcon}>{opt.icon}</Text>
                <Text style={[styles.impLabel, { color: importance === opt.value ? opt.color : Colors.textMuted }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Photo */}
          <Text style={[styles.label, dark && styles.labelDark]}>Photo (optional)</Text>
          <TouchableOpacity style={[styles.photoBtn, dark && styles.photoBtnDark]} onPress={handlePickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={[styles.photoText, dark && styles.photoTextDark]}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {photoUri && (
            <TouchableOpacity onPress={() => setPhotoUri('')} style={styles.removePhoto}>
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
          )}

          {/* Notes */}
          <Text style={[styles.label, dark && styles.labelDark]}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMulti, dark && styles.inputDark]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Serial number, purchase date, condition..."
            placeholderTextColor={Colors.textMuted}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

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
  headerRight: { flexDirection: 'row', gap: Spacing.xs },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 14 },
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
  inputMulti: { height: 90, paddingTop: Spacing.md },
  pickerInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: Typography.fontSizeMD, color: Colors.textPrimary, flex: 1 },
  pickerTextDark: { color: Colors.textPrimaryDark },
  arrow: { color: Colors.textMuted, fontSize: 12 },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  dropdownDark: { backgroundColor: Colors.surfaceDark, borderColor: Colors.borderDark },
  catDropdown: { zIndex: 10 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dropdownItemIcon: { fontSize: 18, marginRight: Spacing.sm },
  dropdownItemText: { flex: 1, fontSize: Typography.fontSizeMD, color: Colors.textPrimary },
  dropdownItemTextDark: { color: Colors.textPrimaryDark },
  dropdownEmpty: { padding: Spacing.lg, color: Colors.textMuted, textAlign: 'center', fontSize: Typography.fontSizeSM },
  dropdownEmptyDark: { color: Colors.textMutedDark },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: Colors.white, fontSize: 22, fontWeight: '700', lineHeight: 26 },
  qtyInput: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.md,
  },
  importanceRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  impOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  impOptionDark: { backgroundColor: Colors.surfaceDark, borderColor: Colors.borderDark },
  impIcon: { fontSize: 14 },
  impLabel: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemiBold },
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
  photoPlaceholder: { height: 90, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { fontSize: 28, marginBottom: Spacing.xs },
  photoText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
  photoTextDark: { color: Colors.textMutedDark },
  removePhoto: { alignItems: 'center', marginBottom: Spacing.sm },
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

export default AddEditItemScreen;

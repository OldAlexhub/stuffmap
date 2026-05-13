import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location, Container, Item, AppSettings } from '../types';
import { STORAGE_KEYS } from '../constants';

// ─── ID generator ────────────────────────────────────────────────────────────
export const generateId = (): string =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const now = (): string => new Date().toISOString();

// ─── Locations ────────────────────────────────────────────────────────────────
export const getLocations = async (): Promise<Location[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocation = async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> => {
  const locations = await getLocations();
  const newLocation: Location = {
    ...location,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify([...locations, newLocation]));
  return newLocation;
};

export const updateLocation = async (id: string, updates: Partial<Omit<Location, 'id' | 'createdAt'>>): Promise<Location | null> => {
  const locations = await getLocations();
  const idx = locations.findIndex(l => l.id === id);
  if (idx === -1) return null;
  locations[idx] = { ...locations[idx], ...updates, updatedAt: now() };
  await AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  return locations[idx];
};

export const deleteLocation = async (id: string): Promise<void> => {
  const [locations, containers, items] = await Promise.all([
    getLocations(),
    getContainers(),
    getItems(),
  ]);
  const filteredLocations = locations.filter(l => l.id !== id);
  const filteredContainers = containers.filter(c => c.locationId !== id);
  const filteredItems = items.filter(i => i.locationId !== id);
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(filteredLocations)),
    AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(filteredContainers)),
    AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems)),
  ]);
};

// ─── Containers ───────────────────────────────────────────────────────────────
export const getContainers = async (): Promise<Container[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getContainersForLocation = async (locationId: string): Promise<Container[]> => {
  const containers = await getContainers();
  return containers.filter(c => c.locationId === locationId);
};

export const saveContainer = async (container: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<Container> => {
  const containers = await getContainers();
  const newContainer: Container = {
    ...container,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify([...containers, newContainer]));
  return newContainer;
};

export const updateContainer = async (id: string, updates: Partial<Omit<Container, 'id' | 'createdAt'>>): Promise<Container | null> => {
  const containers = await getContainers();
  const idx = containers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  containers[idx] = { ...containers[idx], ...updates, updatedAt: now() };
  await AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
  return containers[idx];
};

export const deleteContainer = async (id: string): Promise<void> => {
  const [containers, items] = await Promise.all([getContainers(), getItems()]);
  const filteredContainers = containers.filter(c => c.id !== id);
  const filteredItems = items.filter(i => i.containerId !== id);
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(filteredContainers)),
    AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems)),
  ]);
};

// ─── Items ────────────────────────────────────────────────────────────────────
export const getItems = async (): Promise<Item[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getItemsForContainer = async (containerId: string): Promise<Item[]> => {
  const items = await getItems();
  return items.filter(i => i.containerId === containerId);
};

export const saveItem = async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
  const items = await getItems();
  const newItem: Item = {
    ...item,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([...items, newItem]));
  return newItem;
};

export const updateItem = async (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item | null> => {
  const items = await getItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: now() };
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return items[idx];
};

export const deleteItem = async (id: string): Promise<void> => {
  const items = await getItems();
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items.filter(i => i.id !== id)));
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchAll = async (query: string): Promise<{ item: Item; location: Location; container: Container }[]> => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const [locations, containers, items] = await Promise.all([getLocations(), getContainers(), getItems()]);
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));
  const containerMap = Object.fromEntries(containers.map(c => [c.id, c]));

  return items
    .filter(item => {
      const loc = locationMap[item.locationId];
      const con = containerMap[item.containerId];
      return (
        item.name.toLowerCase().includes(q) ||
        (item.notes?.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        (con?.name.toLowerCase().includes(q)) ||
        (loc?.name.toLowerCase().includes(q)) ||
        (con?.tags.some(t => t.toLowerCase().includes(q)))
      );
    })
    .map(item => ({
      item,
      location: locationMap[item.locationId] || ({ name: 'Unknown' } as Location),
      container: containerMap[item.containerId] || ({ name: 'Unknown' } as Container),
    }));
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  exportIncludeNotes: true,
  exportIncludePhotos: false,
  lastBackupDate: undefined,
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> => {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
};

// ─── Backup ───────────────────────────────────────────────────────────────────
export const exportAllData = async (): Promise<string> => {
  const [locations, containers, items, settings] = await Promise.all([
    getLocations(), getContainers(), getItems(), getSettings(),
  ]);
  return JSON.stringify({ locations, containers, items, settings, exportedAt: now() }, null, 2);
};

export const importAllData = async (jsonString: string): Promise<void> => {
  const data = JSON.parse(jsonString);
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data.locations || [])),
    AsyncStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(data.containers || [])),
    AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items || [])),
  ]);
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.LOCATIONS,
    STORAGE_KEYS.CONTAINERS,
    STORAGE_KEYS.ITEMS,
  ]);
};

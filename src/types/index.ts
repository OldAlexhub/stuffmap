export interface Location {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Container {
  id: string;
  locationId: string;
  name: string;
  description?: string;
  photoUri?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  locationId: string;
  containerId: string;
  name: string;
  photoUri?: string;
  quantity: number;
  category: string;
  tags: string[];
  notes?: string;
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  exportIncludeNotes: boolean;
  exportIncludePhotos: boolean;
  lastBackupDate?: string;
  defaultLocationId?: string;
}

export interface SearchResult {
  item: Item;
  location: Location;
  container: Container;
}

export type ImportanceLevel = 'low' | 'medium' | 'high';

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  LocationDetail: { locationId: string };
  ContainerDetail: { containerId: string; locationId: string };
  AddEditLocation: { locationId?: string } | undefined;
  AddEditContainer: { containerId?: string; locationId?: string } | undefined;
  AddEditItem: { itemId?: string; containerId?: string; locationId?: string } | undefined;
  About: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  LocationsTab: undefined;
  SearchTab: undefined;
  ReportsTab: undefined;
  SettingsTab: undefined;
};

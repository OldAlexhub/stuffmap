import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Location, Container, Item, AppSettings } from '../types';
import * as DB from './database';

interface AppState {
  locations: Location[];
  containers: Container[];
  items: Item[];
  settings: AppSettings;
  isLoaded: boolean;
}

type Action =
  | { type: 'LOAD'; payload: Omit<AppState, 'isLoaded'> }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'DELETE_LOCATION'; payload: string }
  | { type: 'ADD_CONTAINER'; payload: Container }
  | { type: 'UPDATE_CONTAINER'; payload: Container }
  | { type: 'DELETE_CONTAINER'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'RELOAD_ALL'; payload: Omit<AppState, 'isLoaded'> };

const initialState: AppState = {
  locations: [],
  containers: [],
  items: [],
  settings: {
    darkMode: false,
    exportIncludeNotes: true,
    exportIncludePhotos: false,
  },
  isLoaded: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
    case 'RELOAD_ALL':
      return { ...state, ...action.payload, isLoaded: true };
    case 'ADD_LOCATION':
      return { ...state, locations: [...state.locations, action.payload] };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(l => l.id === action.payload.id ? action.payload : l),
      };
    case 'DELETE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(l => l.id !== action.payload),
        containers: state.containers.filter(c => c.locationId !== action.payload),
        items: state.items.filter(i => i.locationId !== action.payload),
      };
    case 'ADD_CONTAINER':
      return { ...state, containers: [...state.containers, action.payload] };
    case 'UPDATE_CONTAINER':
      return {
        ...state,
        containers: state.containers.map(c => c.id === action.payload.id ? action.payload : c),
      };
    case 'DELETE_CONTAINER':
      return {
        ...state,
        containers: state.containers.filter(c => c.id !== action.payload),
        items: state.items.filter(i => i.containerId !== action.payload),
      };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i => i.id === action.payload.id ? action.payload : i),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

interface StorageContextValue {
  state: AppState;
  // Locations
  addLocation: (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Location>;
  updateLocation: (id: string, data: Partial<Omit<Location, 'id' | 'createdAt'>>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  // Containers
  addContainer: (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Container>;
  updateContainer: (id: string, data: Partial<Omit<Container, 'id' | 'createdAt'>>) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  // Items
  addItem: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, data: Partial<Omit<Item, 'id' | 'createdAt'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  // Settings
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  // Helpers
  getLocationById: (id: string) => Location | undefined;
  getContainerById: (id: string) => Container | undefined;
  getItemById: (id: string) => Item | undefined;
  getContainersForLocation: (locationId: string) => Container[];
  getItemsForContainer: (containerId: string) => Item[];
  reloadAll: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadAll = useCallback(async () => {
    const [locations, containers, items, settings] = await Promise.all([
      DB.getLocations(),
      DB.getContainers(),
      DB.getItems(),
      DB.getSettings(),
    ]);
    dispatch({ type: 'LOAD', payload: { locations, containers, items, settings } });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const addLocation = useCallback(async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> => {
    const loc = await DB.saveLocation(data);
    dispatch({ type: 'ADD_LOCATION', payload: loc });
    return loc;
  }, []);

  const updateLocation = useCallback(async (id: string, data: Partial<Omit<Location, 'id' | 'createdAt'>>) => {
    const updated = await DB.updateLocation(id, data);
    if (updated) dispatch({ type: 'UPDATE_LOCATION', payload: updated });
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    await DB.deleteLocation(id);
    dispatch({ type: 'DELETE_LOCATION', payload: id });
  }, []);

  const addContainer = useCallback(async (data: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<Container> => {
    const c = await DB.saveContainer(data);
    dispatch({ type: 'ADD_CONTAINER', payload: c });
    return c;
  }, []);

  const updateContainer = useCallback(async (id: string, data: Partial<Omit<Container, 'id' | 'createdAt'>>) => {
    const updated = await DB.updateContainer(id, data);
    if (updated) dispatch({ type: 'UPDATE_CONTAINER', payload: updated });
  }, []);

  const deleteContainer = useCallback(async (id: string) => {
    await DB.deleteContainer(id);
    dispatch({ type: 'DELETE_CONTAINER', payload: id });
  }, []);

  const addItem = useCallback(async (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    const item = await DB.saveItem(data);
    dispatch({ type: 'ADD_ITEM', payload: item });
    return item;
  }, []);

  const updateItem = useCallback(async (id: string, data: Partial<Omit<Item, 'id' | 'createdAt'>>) => {
    const updated = await DB.updateItem(id, data);
    if (updated) dispatch({ type: 'UPDATE_ITEM', payload: updated });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await DB.deleteItem(id);
    dispatch({ type: 'DELETE_ITEM', payload: id });
  }, []);

  const updateSettings = useCallback(async (data: Partial<AppSettings>) => {
    const updated = await DB.saveSettings(data);
    dispatch({ type: 'UPDATE_SETTINGS', payload: updated });
  }, []);

  const reloadAll = useCallback(async () => {
    const [locations, containers, items, settings] = await Promise.all([
      DB.getLocations(), DB.getContainers(), DB.getItems(), DB.getSettings(),
    ]);
    dispatch({ type: 'RELOAD_ALL', payload: { locations, containers, items, settings } });
  }, []);

  const getLocationById = useCallback((id: string) => state.locations.find(l => l.id === id), [state.locations]);
  const getContainerById = useCallback((id: string) => state.containers.find(c => c.id === id), [state.containers]);
  const getItemById = useCallback((id: string) => state.items.find(i => i.id === id), [state.items]);
  const getContainersForLocation = useCallback((locationId: string) => state.containers.filter(c => c.locationId === locationId), [state.containers]);
  const getItemsForContainer = useCallback((containerId: string) => state.items.filter(i => i.containerId === containerId), [state.items]);

  return (
    <StorageContext.Provider value={{
      state,
      addLocation, updateLocation, deleteLocation,
      addContainer, updateContainer, deleteContainer,
      addItem, updateItem, deleteItem,
      updateSettings,
      getLocationById, getContainerById, getItemById,
      getContainersForLocation, getItemsForContainer,
      reloadAll,
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextValue => {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error('useStorage must be used within StorageProvider');
  return ctx;
};

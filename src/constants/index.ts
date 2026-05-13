export const LOCATION_ICONS = [
  { icon: '🏠', label: 'Home' },
  { icon: '🚗', label: 'Car' },
  { icon: '📦', label: 'Storage Box' },
  { icon: '🏢', label: 'Office' },
  { icon: '🏭', label: 'Warehouse' },
  { icon: '🧳', label: 'Luggage' },
  { icon: '🗄️', label: 'Cabinet' },
  { icon: '🏗️', label: 'Garage' },
  { icon: '🛖', label: 'Shed' },
  { icon: '🏡', label: 'House' },
  { icon: '🚐', label: 'Van' },
  { icon: '🎒', label: 'Backpack' },
  { icon: '📁', label: 'Files' },
  { icon: '🧲', label: 'Workshop' },
  { icon: '🛒', label: 'Storage Unit' },
  { icon: '🎨', label: 'Studio' },
];

export const ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Tools',
  'Documents',
  'Books & Media',
  'Kitchen',
  'Sports & Outdoor',
  'Toys & Games',
  'Seasonal',
  'Furniture',
  'Cables & Accessories',
  'Art & Craft',
  'Medical',
  'Food & Pantry',
  'Cleaning',
  'Pet Supplies',
  'Garden',
  'Automotive',
  'Miscellaneous',
];

export const IMPORTANCE_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const QUICK_START_LOCATIONS = [
  { name: 'Garage', icon: '🏗️', description: 'Tools, vehicles, and outdoor equipment' },
  { name: 'Bedroom Closet', icon: '🏠', description: 'Clothing, shoes, and accessories' },
  { name: 'Kitchen', icon: '🏡', description: 'Pantry, cookware, and appliances' },
  { name: 'Storage Unit', icon: '📦', description: 'Long-term storage items' },
  { name: 'Office', icon: '🏢', description: 'Work supplies, documents, and electronics' },
  { name: 'Attic', icon: '🛖', description: 'Seasonal and rarely-used items' },
];

export const STORAGE_KEYS = {
  LOCATIONS: '@StuffMap:locations',
  CONTAINERS: '@StuffMap:containers',
  ITEMS: '@StuffMap:items',
  SETTINGS: '@StuffMap:settings',
};

export const APP_VERSION = '1.0.0';
export const APP_NAME = 'StuffMap';
export const APP_TAGLINE = 'Find your things faster.';
export const APP_DESCRIPTION = 'Your private offline map for everything you store.';

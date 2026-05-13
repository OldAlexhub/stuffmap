import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '../types';
import { Colors, Typography } from '../theme';

// Screens
import SplashScreen        from '../screens/SplashScreen';
import HomeScreen          from '../screens/HomeScreen';
import LocationsScreen     from '../screens/LocationsScreen';
import LocationDetailScreen  from '../screens/LocationDetailScreen';
import ContainerDetailScreen from '../screens/ContainerDetailScreen';
import SearchScreen        from '../screens/SearchScreen';
import ReportsScreen       from '../screens/ReportsScreen';
import SettingsScreen      from '../screens/SettingsScreen';
import AboutScreen         from '../screens/AboutScreen';
import AddEditLocationScreen  from '../screens/AddEditLocationScreen';
import AddEditContainerScreen from '../screens/AddEditContainerScreen';
import AddEditItemScreen   from '../screens/AddEditItemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  HomeTab:      { active: '🏠', inactive: '🏠' },
  LocationsTab: { active: '📍', inactive: '📍' },
  SearchTab:    { active: '🔍', inactive: '🔍' },
  ReportsTab:   { active: '📊', inactive: '📊' },
  SettingsTab:  { active: '⚙️', inactive: '⚙️' },
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
          elevation: 12,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.white + '66',
        tabBarLabelStyle: {
          fontSize: Typography.fontSizeXS,
          fontWeight: Typography.fontWeightSemiBold,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
                {icons?.active ?? '•'}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab"      component={HomeScreen}      options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="LocationsTab" component={LocationsScreen} options={{ tabBarLabel: 'Locations' }} />
      <Tab.Screen name="SearchTab"    component={SearchScreen}    options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="ReportsTab"   component={ReportsScreen}   options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="SettingsTab"  component={SettingsScreen}  options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Splash"     component={SplashScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="MainTabs"   component={MainTabs} />
        <Stack.Screen
          name="LocationDetail"
          component={LocationDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ContainerDetail"
          component={ContainerDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AddEditLocation"
          component={AddEditLocationScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="AddEditContainer"
          component={AddEditContainerScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="AddEditItem"
          component={AddEditItemScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

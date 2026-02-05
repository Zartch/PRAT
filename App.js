import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import CsvImportScreen from './src/screens/CsvImportScreen';
import CameraScreen from './src/screens/CameraScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

const COLORS = {
  primary: '#8B4513',
  primaryDark: '#654321',
  background: '#FFF8F0',
  textOnPrimary: '#FFFFFF',
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Catàleg':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Afegir':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Importar CSV':
              iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0D5C8',
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Catàleg"
        component={HomeScreen}
        options={{
          title: 'Catàleg',
          headerTitle: 'Forn i Pastisseria Prat',
        }}
      />
      <Tab.Screen
        name="Afegir"
        component={AddProductScreen}
        options={{
          title: 'Afegir',
          headerTitle: 'Nou producte',
        }}
      />
      <Tab.Screen
        name="Importar CSV"
        component={CsvImportScreen}
        options={{
          title: 'Importar',
          headerTitle: 'Importar CSV',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Detall del producte' }}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            title: 'Foto del producte',
            headerStyle: { backgroundColor: '#000' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

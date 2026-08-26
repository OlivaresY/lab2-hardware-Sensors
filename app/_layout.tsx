import { Stack } from 'expo-router';
import { GeoLogProvider } from '../context/GeoLogContext';

export default function RootLayout() {
  return (
    <GeoLogProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ title: 'Nueva Entrada' }} 
        />
        <Stack.Screen 
          name="gallery" 
          options={{ title: 'Mi Bitácora' }} 
        />
      </Stack>
    </GeoLogProvider>
  );
}
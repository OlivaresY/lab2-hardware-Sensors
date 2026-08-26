import * as Location from 'expo-location';
import { Linking } from 'react-native';

/**
 * Solicita permisos de ubicación. Si ya fueron denegados permanentemente,
 * permite redirigir al usuario a los Ajustes del Sistema.
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus, canAskAgain } = await Location.getForegroundPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    if (canAskAgain) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } else {
      // Redirige a los ajustes del sistema si el usuario rechazó el permiso permanentemente
      await Linking.openSettings();
      return false;
    }
  } catch (error) {
    console.error('Error al solicitar permisos de ubicación:', error);
    return false;
  }
};

/**
 * Obtiene la ubicación GPS con Alta Precisión sin lanzar alertas bloqueantes.
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (error) {
    console.error('Error al obtener coordenadas GPS:', error);
    return null;
  }
};
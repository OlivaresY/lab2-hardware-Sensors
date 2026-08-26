import * as Location from 'expo-location';

/**
 * Solicita y verifica los permisos de ubicación en primer plano.
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de ubicación:', error);
    return false;
  }
};

/**
 * Obtiene las coordenadas GPS actuales si los permisos son concedidos.
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (error) {
    console.error('Error al obtener la ubicación actual:', error);
    return null;
  }
};
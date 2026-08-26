import * as Location from 'expo-location';


 /**Solicita permisos de ubicación en primer plano de manera segura.*/

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
 * Obtiene la ubicación GPS con Alta Precisión. Si falla o se niega el permiso, 
 * retorna null de forma segura evitando que la app colapse.
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Garantiza precisión razonable/alta para la bitácora
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
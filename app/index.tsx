import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, MapPin } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGeoLog } from '../context/GeoLogContext';
import { getCurrentLocation, requestLocationPermissions } from '../utils/permissions';

export default function CaptureScreen() {
  const router = useRouter();
  const { addLog } = useGeoLog();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Pedir permisos de ubicación solo una vez al iniciar la pantalla
  useEffect(() => {
    requestLocationPermissions();
  }, []);

  // Manejo inteligente de permisos de cámara (con fallback a Ajustes del Sistema)
  const handleCameraPermissionRequest = async () => {
    if (!permission) return;

    if (permission.canAskAgain) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Permiso denegado',
          'Debes permitir el acceso a la cámara en los ajustes del dispositivo para tomar fotografías.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      Linking.openSettings();
    }
  };

  // Fallback de carga inicial
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Fallback UI si no hay permiso de cámara
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Permisos requeridos</Text>
        <Text style={styles.permissionText}>
          No se ha otorgado acceso a la cámara. Para registrar fotos en la bitácora, habilita el permiso correspondiente.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleCameraPermissionRequest}>
          <Text style={styles.buttonText}>
            {permission.canAskAgain ? 'Conceder Permiso' : 'Abrir Ajustes del Sistema'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/gallery')}
        >
          <Text style={styles.secondaryButtonText}>Ir a la Galería sin foto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tomar la foto y obtener la ubicación actual de forma silenciosa
  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);

        const locationCoords = await getCurrentLocation();
        setLocation(locationCoords);

        if (!locationCoords) {
          Alert.alert(
            'Aviso de Ubicación',
            'No se lograron obtener las coordenadas GPS exactas. La entrada se guardará sin datos de localización.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al intentar capturar la imagen.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!photoUri) {
      Alert.alert('Atención', 'Debes tomar una fotografía primero.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Atención', 'Ingresa un título para la bitácora.');
      return;
    }

    setIsCapturing(true);

    try {
      addLog({
        id: Date.now().toString(),
        photoUri,
        title: title.trim(),
        description: description.trim(),
        location,
        timestamp: Date.now(),
      });

      setPhotoUri(null);
      setLocation(null);
      setTitle('');
      setDescription('');
      setIsCapturing(false);

      router.push('/gallery');
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Error', 'Ocurrió un error al guardar la entrada en la bitácora.');
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#2563eb" size="large" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Fotografía</Text>
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          {location ? (
            <View style={styles.locationBadge}>
              <MapPin color="#fff" size={14} />
              <Text style={styles.locationBadgeText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          ) : (
            <View style={[styles.locationBadge, styles.noLocationBadge]}>
              <MapPin color="#fff" size={14} />
              <Text style={styles.locationBadgeText}>Sin GPS</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setShowCamera(true)}
          >
            <Camera color="#fff" size={18} />
            <Text style={styles.retakeText}>Repetir foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.photoPlaceholder}
          onPress={() => setShowCamera(true)}
        >
          <Camera color="#64748b" size={48} />
          <Text style={styles.placeholderText}>Abrir Cámara</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Avistamiento de fauna / Punto GPS"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Añade detalles del entorno o hallazgo..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, isCapturing && styles.disabledButton]}
        onPress={handleSaveEntry}
        disabled={isCapturing}
      >
        {isCapturing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar Entrada en Bitácora</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push('/gallery')}
      >
        <ImageIcon color="#3b82f6" size={20} />
        <Text style={styles.secondaryButtonText}>Ver Fotografías Registradas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#334155',
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 12,
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  placeholderText: { marginTop: 8, color: '#64748b', fontSize: 16 },
  previewContainer: { position: 'relative', height: 220, borderRadius: 12 },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  locationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  noLocationBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.8)',
  },
  locationBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  retakeButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  retakeText: { color: '#fff', fontSize: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  disabledButton: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
  },
  secondaryButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: '600' },
});
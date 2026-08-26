import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGeoLog } from '../context/GeoLogContext';
import { getCurrentLocation } from '../utils/permissions';

export default function CaptureScreen() {
  const router = useRouter();
  const { addLog } = useGeoLog();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Solicitar/verificar permisos de cámara
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Necesitamos tu permiso para acceder a la cámara.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tomar fotografía
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la fotografía');
      }
    }
  };

  // Guardar entrada con ubicación GPS
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
      // Obtener ubicación GPS usando el utilitario refactorizado
      const locationCoords = await getCurrentLocation();

      if (!locationCoords) {
        Alert.alert(
          'Aviso',
          'No se otorgaron permisos de ubicación. La foto se guardará sin datos GPS.'
        );
      }

      // Crea objeto de bitácora
      addLog({
        id: Date.now().toString(),
        photoUri,
        title,
        description,
        location: locationCoords,
        timestamp: Date.now(),
      });

      // Limpiar formulario y navegar a la Galería
      setPhotoUri(null);
      setTitle('');
      setDescription('');
      setIsCapturing(false);

      router.push('/gallery');
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Error', 'Ocurrió un error al procesar la entrada.');
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
            >
              <View style={styles.captureButtonInner} />
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
        <Text style={styles.secondaryButtonText}>Ver Fotografía Registradas</Text>
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
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#334155',
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
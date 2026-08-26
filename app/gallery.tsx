import { Calendar, MapPin } from 'lucide-react-native';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useGeoLog } from '../context/GeoLogContext';

export default function GalleryScreen() {
  const { logs } = useGeoLog();

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Bitácora Vacía</Text>
        <Text style={styles.emptySubtitle}>
          No has guardado ninguna entrada con foto y ubicación aún.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photoUri }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              
              {item.description ? (
                <Text style={styles.cardDescription}>{item.description}</Text>
              ) : null}

              <View style={styles.metaRow}>
                <MapPin size={16} color="#ef4444" />
                <Text style={styles.metaText}>
                  {item.location
                    ? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
                    : 'Ubicación no disponible'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Calendar size={16} color="#64748b" />
                <Text style={styles.metaText}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8fafc',
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#334155' },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 200 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  cardDescription: { fontSize: 14, color: '#475569', marginVertical: 8 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: { fontSize: 13, color: '#64748b' },
});
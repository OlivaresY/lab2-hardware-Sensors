import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { GeoLog } from '../types';

interface GeoLogContextType {
  logs: GeoLog[];
  addLog: (log: GeoLog) => void;
  isLoading: boolean;
}

const STORAGE_KEY = '@bitacora_geografica_logs';

const GeoLogContext = createContext<GeoLogContextType | undefined>(undefined);

export const GeoLogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<GeoLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar registros guardados al abrir la app
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const storedLogs = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        }
      } catch (error) {
        console.error('Error al cargar la bitácora:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Guardar nuevo registro en la memoria del teléfono
  const addLog = async (newLog: GeoLog) => {
    try {
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error al guardar en el disco:', error);
    }
  };

  return (
    <GeoLogContext.Provider value={{ logs, addLog, isLoading }}>
      {children}
    </GeoLogContext.Provider>
  );
};

export const useGeoLog = () => {
  const context = useContext(GeoLogContext);
  if (!context) {
    throw new Error('useGeoLog debe utilizarse dentro de un GeoLogProvider');
  }
  return context;
};
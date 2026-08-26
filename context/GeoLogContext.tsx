import React, { createContext, ReactNode, useContext, useState } from 'react';
import { GeoLog } from '../types';

interface GeoLogContextType {
  logs: GeoLog[];
  addLog: (log: GeoLog) => void;
}

const GeoLogContext = createContext<GeoLogContextType | undefined>(undefined);

export const GeoLogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<GeoLog[]>([]);

  const addLog = (newLog: GeoLog) => {
    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <GeoLogContext.Provider value={{ logs, addLog }}>
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
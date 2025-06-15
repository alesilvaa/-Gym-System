import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/api';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    nombreGimnasio: 'Mi Gimnasio',
    direccion: '',
    telefono: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data || {
        nombreGimnasio: 'Mi Gimnasio',
        direccion: '',
        telefono: '',
        email: ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default values if there's an error
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = await settingsService.updateSettings(newSettings);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 
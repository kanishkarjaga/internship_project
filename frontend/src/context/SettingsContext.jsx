import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.js';

const SettingsContext = createContext({ settings: null, refresh: () => {} });

const FALLBACK = {
  businessName: 'StitchWorks Embroidery',
  tagline: 'Computer-precise embroidery, custom-made.',
  contactEmail: 'hello@embroidery.local',
  contactPhone: '+1 555 0100',
  address: '',
  aboutText: 'High-quality computer embroidery for apparel, accessories, and gifts.',
  socials: { facebook: '', instagram: '', twitter: '' },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);

  async function refresh() {
    try {
      const data = await api.get('/public/settings');
      setSettings({ ...FALLBACK, ...(data || {}) });
    } catch (_) {
      setSettings(FALLBACK);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.propops.app',
  appName: 'PropOps',
  webDir: 'out',
  server: {
    // Punta direttamente al deployment Vercel
    // L'app nativa carica sempre il codice aggiornato dal server
    url: 'https://property-operations-manager.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

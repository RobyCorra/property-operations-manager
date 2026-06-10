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
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1C1C1E',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FFFFFF',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

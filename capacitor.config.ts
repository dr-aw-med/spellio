import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.spellio.app',
  appName: 'Spellio',
  webDir: 'dist',
  server: {
    // En dev, décommenter pour live reload :
    // url: 'http://192.168.x.x:3000',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#EEF2FF',
  },
  android: {
    backgroundColor: '#EEF2FF',
  },
};

export default config;

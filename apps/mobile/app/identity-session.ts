import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  createSessionVault,
  type SessionStorage,
} from './identity-session-vault';

const sessionKey = 'tavira.identity.session.v1';
let webSession: string | null = null;

const nativeStorage: SessionStorage = {
  get: () => SecureStore.getItemAsync(sessionKey),
  set: (value) => SecureStore.setItemAsync(sessionKey, value),
  remove: () => SecureStore.deleteItemAsync(sessionKey),
};

const memoryWebStorage: SessionStorage = {
  get: () => Promise.resolve(webSession),
  set: (value) => {
    webSession = value;
    return Promise.resolve();
  },
  remove: () => {
    webSession = null;
    return Promise.resolve();
  },
};

export const sessionVault = createSessionVault(
  Platform.OS === 'web' ? memoryWebStorage : nativeStorage,
);

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN = 'mp.access';
const REFRESH = 'mp.refresh';
const PIN = 'mp.pin';
const BIO = 'mp.bio';

const memory = new Map<string, string>();

async function read(key: string) {
  try {
    if (Platform.OS !== 'web') {
      const v = await SecureStore.getItemAsync(key);
      if (v != null) return v;
    }
  } catch {
    /* web / missing native module */
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

async function write(key: string, value: string) {
  memory.set(key, value);
  try {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync(key, value);
  } catch {
    /* ignore */
  }
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

async function remove(key: string) {
  memory.delete(key);
  try {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const secure = {
  getAccess: () => read(TOKEN),
  setAccess: (v: string) => write(TOKEN, v),
  getRefresh: () => read(REFRESH),
  setRefresh: (v: string) => write(REFRESH, v),
  setPin: (v: string) => write(PIN, v),
  getPin: () => read(PIN),
  setBio: (v: boolean) => write(BIO, v ? '1' : '0'),
  getBio: async () => (await read(BIO)) === '1',
  clearSession: async () => {
    await remove(TOKEN);
    await remove(REFRESH);
  },
};

export const prefs = {
  get: async (k: string) => {
    try {
      return await AsyncStorage.getItem(k);
    } catch {
      return memory.get(`pref:${k}`) ?? null;
    }
  },
  set: async (k: string, v: string) => {
    memory.set(`pref:${k}`, v);
    try {
      await AsyncStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};

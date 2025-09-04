import Storage from 'expo-sqlite/kv-store'

export const storage = {
  clear: async () => Storage.clear(),
  getAllKeys: async () => Storage.getAllKeys(),
  getItem: async (key: string) => Storage.getItem(key),
  removeItem: async (key: string) => Storage.removeItem(key),
  setItem: async (key: string, value: string) => Storage.setItem(key, value),
}

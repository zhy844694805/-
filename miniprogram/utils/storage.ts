const memoryStorage = new Map<string, string>();

function hasWxStorage(): boolean {
  return typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function';
}

export function loadJson<T>(key: string): T | null {
  const rawValue = hasWxStorage() ? wx.getStorageSync<string>(key) : memoryStorage.get(key);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as T;
}

export function saveJson(key: string, value: unknown): void {
  const serializedValue = JSON.stringify(value);

  if (hasWxStorage()) {
    wx.setStorageSync(key, serializedValue);
    return;
  }

  memoryStorage.set(key, serializedValue);
}

export async function isOnline(): Promise<boolean> {
  if (typeof wx === 'undefined' || typeof wx.getNetworkType !== 'function') {
    return true;
  }

  const response = await wx.getNetworkType();
  return response.networkType !== 'none';
}

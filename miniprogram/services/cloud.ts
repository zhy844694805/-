export function initCloud(): void {
  if (!wx.cloud) {
    throw new Error('wx.cloud unavailable');
  }

  wx.cloud.init({ traceUser: true });
}

import { AppStore } from '@/stores/app-store';

const appStore = new AppStore();

Page({
  data: {
    bootstrapState: 'loading',
    bootstrapError: '',
    userNickname: '',
    hasSession: false,
  },

  onLoad() {
    void this.bootstrap();
  },

  async bootstrap() {
    await appStore.bootstrap();

    this.setData({
      bootstrapState: appStore.state,
      bootstrapError: appStore.errorMessage,
      userNickname: appStore.user?.nickname ?? '',
      hasSession: Boolean(appStore.user),
    });
  },
});

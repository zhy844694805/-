import { AppUserSession } from '@/models/user';
import { loadCurrentUser } from '@/services/user-service';

export type AppBootstrapState = 'idle' | 'loading' | 'ready' | 'error';

export class AppStore {
  state: AppBootstrapState = 'idle';
  user: AppUserSession | null = null;
  errorMessage = '';

  async bootstrap(): Promise<void> {
    this.state = 'loading';

    try {
      this.user = await loadCurrentUser();
      this.state = 'ready';
      this.errorMessage = '';
    } catch (error) {
      this.user = null;
      this.state = 'error';
      this.errorMessage = error instanceof Error ? error.message : '加载用户信息失败';
    }
  }
}

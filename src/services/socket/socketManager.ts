import { io, Socket } from 'socket.io-client';
import { appConfig } from '@/config/app.config';
import { getAuthToken } from '@/src/storage/secureAuth';

class SocketManager {
  private socket: Socket | null = null;
  private url: string = process.env.EXPO_PUBLIC_SOCKET_URL || appConfig.urls.cmmsBase;

  public async connect(): Promise<void> {
    if (this.socket?.connected) return;

    const token = await getAuthToken();
    const useAuthStore = require('@/src/state/auth/useAuthStore').useAuthStore;
    const accountId = useAuthStore.getState().user?.account_id || '';

    let socketUrl = this.url;
    let socketPath = '/socket.io';
    try {
      const parsedUrl = new URL(this.url);
      if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
        socketPath = `${parsedUrl.pathname}/socket.io`.replace(/\/\//g, '/');
      }
      socketUrl = parsedUrl.origin;
    } catch (e) {
      console.warn('[Socket] Could not parse URL for socket path', e);
    }

    this.socket = io(socketUrl, {
      path: socketPath,
      auth: { token, accountId },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected: ${this.socket?.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`[Socket] Connection Error:`, error);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Disconnected manually');
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  public emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Cannot emit ${event}, socket is disconnected.`);
      return;
    }
    this.socket.emit(event, data);
  }
}

export const socketManager = new SocketManager();

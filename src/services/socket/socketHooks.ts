import { useEffect } from 'react';
import { socketManager } from './socketManager';

export const useSocketEvent = (event: string, callback: (...args: any[]) => void) => {
  useEffect(() => {
    socketManager.on(event, callback);

    return () => {
      socketManager.off(event, callback);
    };
  }, [event, callback]);
};

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { notificationService } from './notificationService';

export const useNotificationHandler = () => {
  useEffect(() => {
    notificationService.initialize();

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      // Handle deep linking or navigation based on notification data
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
};

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { resolveNotificationHref } from './task-detail-route';

export function useTimerNotificationObserver(width: number) {
  useEffect(() => {
    function redirectFromNotification(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (typeof url === 'string') {
        router.push(resolveNotificationHref(url, width));
      }
    }

    try {
      const lastResponse = Notifications.getLastNotificationResponse();

      if (lastResponse?.notification) {
        redirectFromNotification(lastResponse.notification);
        Notifications.clearLastNotificationResponse();
      }
    } catch {
      // Expo Notifications is unavailable on web and some preview runtimes.
    }

    let subscription: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null =
      null;

    try {
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        redirectFromNotification(response.notification);
      });
    } catch {
      // Expo Notifications is unavailable on web and some preview runtimes.
    }

    return () => {
      subscription?.remove();
    };
  }, [width]);
}

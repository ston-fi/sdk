'use client';

import { useEffect } from 'react';
import telegramAnalytics from '@telegram-apps/analytics';

export default function AnalyticsInit() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_ANALYTICS_TOKEN;
    const appName = process.env.NEXT_PUBLIC_TELEGRAM_ANALYTICS_APP_NAME;

    if (token && appName) {
      telegramAnalytics.init({
        token,
        appName,
      });
    }
  }, []);

  return null;
}

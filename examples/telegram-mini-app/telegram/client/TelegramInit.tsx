'use client';

import { useEffect } from 'react';
import {
  backButton,
  closingBehavior,
  init,
  miniApp,
} from '@telegram-apps/sdk-react';

export default function TelegramInit() {
  useEffect(() => {
    try {
      init(); // Initialize Telegram SDK
      if (backButton.mount.isAvailable()) {
        backButton.mount();
        backButton.onClick(() => {
          if (backButton.isMounted()) {
            backButton.hide();
          }
          window.history.back();
        });
      }
      console.log('TelegramProvider - init()');
      if (miniApp.mountSync.isAvailable()) {
        miniApp.mountSync();
      }
      if (closingBehavior.mount.isAvailable()) {
        closingBehavior.mount();
        closingBehavior.isMounted(); // true
      }
      if (closingBehavior.enableConfirmation.isAvailable()) {
        closingBehavior.enableConfirmation();
        closingBehavior.isConfirmationEnabled(); // true
      }
    } catch (err) {
      console.error('Telegram SDK init failed:', err);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    return () => {
      if (backButton.isMounted()) {
        backButton.unmount();
      }
    };
  }, []);

  return null;
}
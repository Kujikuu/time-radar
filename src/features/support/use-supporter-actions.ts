import { useCallback, useMemo, useState } from 'react';

import { useSettings } from '@/src/features/focus/hooks';

import { useSupporterPurchase } from './purchase';

export function useSupporterActions() {
  const [supportMessageKey, setSupportMessageKey] = useState<string | undefined>();
  const { settings, save } = useSettings();
  const activateSupporter = useCallback(() => {
    void save({ supporterPurchased: true, supporterThemeEnabled: true });
  }, [save]);
  const supporterPurchase = useSupporterPurchase({
    locallyPurchased: settings.supporterPurchased,
    onPurchased: activateSupporter,
  });
  const supporterMessageKey = supportMessageKey ?? supporterPurchase.status.messageKey;
  const supportActionsDisabled = supporterPurchase.status.loading;

  const buy = useCallback(async () => {
    const result = await supporterPurchase.buy();
    setSupportMessageKey(result.messageKey);

    if (result.purchased) {
      activateSupporter();
    }
  }, [activateSupporter, supporterPurchase]);

  const restore = useCallback(async () => {
    const result = await supporterPurchase.restore();
    setSupportMessageKey(result.messageKey);

    if (result.purchased) {
      activateSupporter();
    }
  }, [activateSupporter, supporterPurchase]);

  return useMemo(
    () => ({
      settings,
      supporterMessageKey,
      supportActionsDisabled,
      priceLabel: supporterPurchase.status.priceLabel,
      buy,
      restore,
    }),
    [buy, restore, settings, supportActionsDisabled, supporterMessageKey, supporterPurchase.status.priceLabel]
  );
}

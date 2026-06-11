import { finishTransaction, useIAP, type Purchase } from 'expo-iap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  SUPPORTER_PRICE_LABEL,
  SUPPORTER_PRODUCT_ID,
  SUPPORTER_PRODUCT_TYPE,
} from './constants';
import type {
  SupporterProductStatus,
  SupporterPurchaseResult,
} from './purchase.web';

type UseSupporterPurchaseOptions = {
  locallyPurchased?: boolean;
  onPurchased?: () => void;
};

function isSupporterPurchase(purchase: Purchase) {
  return purchase.productId === SUPPORTER_PRODUCT_ID;
}

export function useSupporterPurchase({
  locallyPurchased = false,
  onPurchased,
}: UseSupporterPurchaseOptions = {}) {
  const [storePurchased, setStorePurchased] = useState(false);
  const [messageKey, setMessageKey] = useState<string | undefined>();
  const entitlementReportedRef = useRef(locallyPurchased);

  const markPurchased = useCallback(() => {
    setStorePurchased(true);

    if (!entitlementReportedRef.current) {
      entitlementReportedRef.current = true;
      onPurchased?.();
    }
  }, [onPurchased]);

  useEffect(() => {
    if (locallyPurchased) {
      setStorePurchased(true);
      entitlementReportedRef.current = true;
    }
  }, [locallyPurchased]);

  const {
    availablePurchases,
    connected,
    fetchProducts,
    getAvailablePurchases,
    products,
    requestPurchase,
    restorePurchases,
  } = useIAP({
    onError: () => setMessageKey('support.purchaseUnavailable'),
    onPurchaseError: () => setMessageKey('support.purchaseUnavailable'),
    onPurchaseSuccess: async (purchase) => {
      if (!isSupporterPurchase(purchase)) {
        return;
      }

      await finishTransaction({ purchase, isConsumable: false });
      setMessageKey('support.purchaseComplete');
      markPurchased();
    },
  });

  useEffect(() => {
    if (!connected) {
      return;
    }

    void fetchProducts({ skus: [SUPPORTER_PRODUCT_ID], type: SUPPORTER_PRODUCT_TYPE });
    void getAvailablePurchases();
  }, [connected, fetchProducts, getAvailablePurchases]);

  useEffect(() => {
    if (availablePurchases.some(isSupporterPurchase)) {
      markPurchased();
    }
  }, [availablePurchases, markPurchased]);

  const product = products.find((item) => item.id === SUPPORTER_PRODUCT_ID);
  const purchased = locallyPurchased || storePurchased;
  const priceLabel = product?.displayPrice ?? SUPPORTER_PRICE_LABEL;

  const status = useMemo<SupporterProductStatus>(
    () => ({
      supported: connected,
      purchased,
      productId: SUPPORTER_PRODUCT_ID,
      priceLabel,
      loading: !connected || products.length === 0,
      messageKey,
    }),
    [connected, messageKey, priceLabel, products.length, purchased]
  );

  const buy = useCallback(async (): Promise<SupporterPurchaseResult> => {
    if (!connected) {
      return { purchased: false, messageKey: 'support.unavailable' };
    }

    try {
      await requestPurchase({
        request: {
          apple: { sku: SUPPORTER_PRODUCT_ID },
          google: { skus: [SUPPORTER_PRODUCT_ID] },
        },
        type: SUPPORTER_PRODUCT_TYPE,
      });
    } catch {
      return { purchased: false, messageKey: 'support.purchaseUnavailable' };
    }

    return { purchased: false, messageKey: 'support.purchasePending' };
  }, [connected, requestPurchase]);

  const restore = useCallback(async (): Promise<SupporterPurchaseResult> => {
    if (!connected) {
      return { purchased: false, messageKey: 'support.unavailable' };
    }

    const restored = availablePurchases.some(isSupporterPurchase);
    if (restored) {
      markPurchased();
    }

    try {
      await restorePurchases();
      await getAvailablePurchases();
    } catch {
      return {
        purchased: restored,
        messageKey: restored ? 'support.purchaseRestored' : 'support.purchaseUnavailable',
      };
    }

    return {
      purchased: restored,
      messageKey: restored ? 'support.purchaseRestored' : 'support.purchaseRestorePending',
    };
  }, [availablePurchases, connected, getAvailablePurchases, markPurchased, restorePurchases]);

  return { status, buy, restore };
}

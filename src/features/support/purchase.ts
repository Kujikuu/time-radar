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

const PRODUCT_LOAD_TIMEOUT_MS = 10_000;

function logIapError(scope: string, error: unknown) {
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);
  console.warn(`[IAP:${scope}] ${detail}`, error);
}

function isSupporterPurchase(purchase: Purchase) {
  return purchase.productId === SUPPORTER_PRODUCT_ID;
}

export function useSupporterPurchase({
  locallyPurchased = false,
  onPurchased,
}: UseSupporterPurchaseOptions = {}) {
  const [storePurchased, setStorePurchased] = useState(false);
  const [messageKey, setMessageKey] = useState<string | undefined>();
  const [productLoadFailed, setProductLoadFailed] = useState(false);
  const entitlementReportedRef = useRef(locallyPurchased);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markPurchased = useCallback(() => {
    setStorePurchased(true);

    if (!entitlementReportedRef.current) {
      entitlementReportedRef.current = true;
      onPurchased?.();
    }
  }, [onPurchased]);

  useEffect(() => {
    if (locallyPurchased) {
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
    onError: (error: unknown) => {
      logIapError('store', error);
      setMessageKey('support.purchaseUnavailable');
      setProductLoadFailed(true);
    },
    onPurchaseError: (error: unknown) => {
      logIapError('purchase', error);
      setMessageKey('support.purchaseUnavailable');
    },
    onPurchaseSuccess: async (purchase) => {
      if (!isSupporterPurchase(purchase)) {
        return;
      }

      await finishTransaction({ purchase, isConsumable: false });
      setMessageKey('support.purchaseComplete');
      markPurchased();
    },
  });

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const product = products.find((item) => item.id === SUPPORTER_PRODUCT_ID);

  const doFetchProducts = useCallback(async () => {
    if (!connected) {
      return;
    }

    setProductLoadFailed(false);
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => {
      logIapError('fetchTimeout', { productId: SUPPORTER_PRODUCT_ID });
      setProductLoadFailed(true);
    }, PRODUCT_LOAD_TIMEOUT_MS);

    try {
      await fetchProducts({ skus: [SUPPORTER_PRODUCT_ID], type: SUPPORTER_PRODUCT_TYPE });
      await getAvailablePurchases();
    } catch (error: unknown) {
      logIapError('fetch', error);
      setProductLoadFailed(true);
    }
    // Success path is owned by the product-arrived effect below — fetchProducts resolving
    // does not synchronously populate products[].
  }, [clearLoadTimeout, connected, fetchProducts, getAvailablePurchases]);

  const retryProductLoad = useCallback(() => {
    void doFetchProducts();
  }, [doFetchProducts]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    void doFetchProducts();
    return clearLoadTimeout;
  }, [connected, doFetchProducts, clearLoadTimeout]);

  useEffect(() => {
    if (product) {
      clearLoadTimeout();
      setProductLoadFailed(false);
    }
  }, [product, clearLoadTimeout]);

  useEffect(() => clearLoadTimeout, [clearLoadTimeout]);

  const hasAvailableSupporterPurchase = availablePurchases.some(isSupporterPurchase);

  useEffect(() => {
    if (hasAvailableSupporterPurchase && !entitlementReportedRef.current) {
      entitlementReportedRef.current = true;
      onPurchased?.();
    }
  }, [hasAvailableSupporterPurchase, onPurchased]);

  const purchased = locallyPurchased || storePurchased || hasAvailableSupporterPurchase;
  const priceLabel = product?.displayPrice ?? SUPPORTER_PRICE_LABEL;

  const hasProduct = Boolean(product);
  const fetchSettled = hasProduct || productLoadFailed;
  const loading = connected && !fetchSettled;

  const status = useMemo<SupporterProductStatus>(
    () => ({
      supported: connected,
      purchased,
      productId: SUPPORTER_PRODUCT_ID,
      priceLabel,
      loading,
      productLoadFailed,
      canRetry: connected && productLoadFailed,
      messageKey,
    }),
    [connected, loading, messageKey, priceLabel, productLoadFailed, purchased]
  );

  const buy = useCallback(async (): Promise<SupporterPurchaseResult> => {
    if (!connected) {
      return { purchased: false, messageKey: 'support.unavailable' };
    }

    if (!product) {
      void retryProductLoad();
      return { purchased: false, messageKey: 'support.productLoadFailed' };
    }

    try {
      await requestPurchase({
        request: {
          apple: { sku: SUPPORTER_PRODUCT_ID },
          google: { skus: [SUPPORTER_PRODUCT_ID] },
        },
        type: SUPPORTER_PRODUCT_TYPE,
      });
    } catch (error: unknown) {
      logIapError('buy', error);
      return { purchased: false, messageKey: 'support.purchaseUnavailable' };
    }

    return { purchased: false, messageKey: 'support.purchasePending' };
  }, [connected, product, requestPurchase, retryProductLoad]);

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
    } catch (error: unknown) {
      logIapError('restore', error);
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

  return { status, buy, restore, retryProductLoad };
}

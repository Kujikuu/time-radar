import { useCallback } from 'react';

import {
  SUPPORTER_PRICE_LABEL,
  SUPPORTER_PRODUCT_ID,
} from './constants';

export type SupporterPurchaseResult = {
  purchased: boolean;
  messageKey: string;
};

export type SupporterProductStatus = {
  supported: boolean;
  purchased: boolean;
  productId: string;
  priceLabel: string;
  loading: boolean;
  messageKey?: string;
};

type UseSupporterPurchaseOptions = {
  locallyPurchased?: boolean;
  onPurchased?: () => void;
};

const unsupportedStatus = (purchased = false): SupporterProductStatus => ({
  supported: false,
  purchased,
  productId: SUPPORTER_PRODUCT_ID,
  priceLabel: SUPPORTER_PRICE_LABEL,
  loading: false,
  messageKey: 'support.unavailable',
});

export async function loadSupporterProduct() {
  return unsupportedStatus(false);
}

export async function buySupporterPack(): Promise<SupporterPurchaseResult> {
  return { purchased: false, messageKey: 'support.unavailable' };
}

export async function restoreSupporterPack(): Promise<SupporterPurchaseResult> {
  return { purchased: false, messageKey: 'support.unavailable' };
}

export function useSupporterPurchase({
  locallyPurchased = false,
}: UseSupporterPurchaseOptions = {}) {
  return {
    status: unsupportedStatus(locallyPurchased),
    buy: useCallback(buySupporterPack, []),
    restore: useCallback(restoreSupporterPack, []),
  };
}

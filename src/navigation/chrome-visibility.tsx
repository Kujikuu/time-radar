import { createContext, type PropsWithChildren, use, useMemo, useState } from 'react';

type NavigationChromeVisibilityContextValue = {
  isNavigationChromeHidden: boolean;
  setNavigationChromeHidden: (isHidden: boolean) => void;
};

const NavigationChromeVisibilityContext = createContext<NavigationChromeVisibilityContextValue>({
  isNavigationChromeHidden: false,
  setNavigationChromeHidden: () => undefined,
});

export function NavigationChromeProvider({ children }: PropsWithChildren) {
  const [isNavigationChromeHidden, setNavigationChromeHidden] = useState(false);

  const value = useMemo<NavigationChromeVisibilityContextValue>(
    () => ({
      isNavigationChromeHidden,
      setNavigationChromeHidden,
    }),
    [isNavigationChromeHidden]
  );

  return <NavigationChromeVisibilityContext value={value}>{children}</NavigationChromeVisibilityContext>;
}

export function useNavigationChromeVisibility() {
  return use(NavigationChromeVisibilityContext);
}

export function useSetNavigationChromeHidden() {
  return useNavigationChromeVisibility().setNavigationChromeHidden;
}

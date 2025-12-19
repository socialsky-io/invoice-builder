import type { TOptions } from 'i18next';
import { useTranslation } from 'react-i18next';

export const useUppercaseTranslation = (enabled?: boolean) => {
  const { t, i18n } = useTranslation();

  const tt = (key: string, options?: TOptions) => {
    const text = t(key, options);
    return enabled ? text.toLocaleUpperCase(i18n.language) : text;
  };

  return { tt };
};

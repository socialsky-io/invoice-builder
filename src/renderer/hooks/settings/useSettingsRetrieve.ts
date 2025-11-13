import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import type { Settings } from '../../types/settings';
import { useAsyncAction } from '../useAsyncAction';

export const useSettingsRetrieve = ({ showLoader = true, onDone }: RequestHook) => {
  const asyncFn = useCallback(() => window.electronAPI.getAllSettings(), []);

  const { data: settings, loading, execute } = useAsyncAction<Settings>(asyncFn, { showLoader, onDone });

  return { settings, loading, execute };
};

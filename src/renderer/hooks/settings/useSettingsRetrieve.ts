import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '../../state/configureStore';
import { setSettings } from '../../state/pageSlice';
import type { RequestHook } from '../../types/requestHook';
import type { Settings } from '../../types/settings';
import { useAsyncAction } from '../useAsyncAction';

export const useSettingsRetrieve = ({ showLoader = true }: RequestHook) => {
  const dispatch = useAppDispatch();
  const asyncFn = useCallback(() => window.electronAPI.getAllSettings(), []);
  const { data: settings, loading, execute } = useAsyncAction<Settings>(asyncFn, { showLoader });

  useEffect(() => {
    if (!settings) return;
    dispatch(setSettings(settings));
  }, [settings, dispatch]);

  return { settings, loading, execute };
};

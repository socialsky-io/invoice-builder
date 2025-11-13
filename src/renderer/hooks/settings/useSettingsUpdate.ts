import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import type { SettingsUpdate } from '../../types/settings';
import { useAsyncAction } from '../useAsyncAction';

interface UseSettingsUpdateParams extends RequestHook {
  newSettings: SettingsUpdate;
}

export const useSettingsUpdate = ({
  newSettings,
  immediate = true,
  showLoader = true,
  onDone
}: UseSettingsUpdateParams) => {
  const asyncFn = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    return window.electronAPI.updateSettings(newSettings);
  }, [newSettings]);

  const { data, loading, execute } = useAsyncAction<{ success: boolean; message?: string }>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};

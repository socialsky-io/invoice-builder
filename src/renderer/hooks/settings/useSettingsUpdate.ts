import { useCallback } from 'react';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
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
  const asyncFn = useCallback(async (): Promise<Response> => {
    return window.electronAPI.updateSettings(newSettings);
  }, [newSettings]);

  const { data, loading, execute } = useAsyncAction<Response>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data, loading, execute };
};

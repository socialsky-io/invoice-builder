import { useCallback, useEffect, type FC } from 'react';
import { SpinnerOverlay } from '../components/spinner/spinner';
import { ToastContainer } from '../components/toast/toastContainer';
import { useSettingsRetrieve } from '../hooks/settings/useSettingsRetrieve';
import { useAppDispatch, useAppSelector } from '../state/configureStore';
import { addToast, removeToast, selectIsLoading, selectToasts, setSettings } from '../state/pageSlice';
import type { Response } from '../types/response';
import { AppLayout } from './AppLayout';

export const App: FC = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  const { settings } = useSettingsRetrieve({
    onDone: (data: Response) => {
      if (!data.success && data.message) {
        dispatch(addToast({ message: data.message, severity: 'error' }));
      }
    }
  });

  const handleClose = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  useEffect(() => {
    if (settings) {
      dispatch(setSettings(settings));
    }
  }, [settings, dispatch]);

  return (
    <>
      <AppLayout />
      <ToastContainer toasts={toasts} onClose={handleClose} />
      {isLoading && <SpinnerOverlay />}
    </>
  );
};

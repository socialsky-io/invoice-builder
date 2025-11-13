import { useCallback, useEffect, type FC } from 'react';
import { SpinnerOverlay } from '../components/spinner/spinner';
import { ToastContainer } from '../components/toast/toastContainer';
import { useSettingsRetrieve } from '../hooks/settings/useSettingsRetrieve';
import { useAppDispatch, useAppSelector } from '../state/configureStore';
import { removeToast, selectIsLoading, selectToasts, setSettings } from '../state/pageSlice';
import { AppLayout } from './AppLayout';

export const App: FC = () => {
  const isLoading = useAppSelector(selectIsLoading);
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  const { settings } = useSettingsRetrieve({});

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

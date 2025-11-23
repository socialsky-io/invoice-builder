import { useEffect, type FC, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAppDispatch } from '../../../../state/configureStore';
import { addToast } from '../../../../state/pageSlice';

const ErrorFallback: FC<{ error: Error }> = ({ error }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(addToast({ message: error.message, severity: 'error' }));
  }, [dispatch, error]);

  return null;
};

export const GlobalErrorBoundaryWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
);

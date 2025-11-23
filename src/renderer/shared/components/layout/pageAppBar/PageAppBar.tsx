import { Box, Dialog, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useState, type FC, type ReactNode } from 'react';
import { ModalAppBar } from '../modalAppBar/ModalAppBar';
import { PageHeader } from '../pageHeader/PageHeader';

interface Props {
  isModal?: boolean;
  isOpen?: boolean;
  showBack?: boolean;
  title: string;
  handleClose?: () => void;
  handleSave?: (data: unknown) => void;
  renderForm: (opts: { onChange: (properties: { changedData: unknown; isFormValid: boolean }) => void }) => ReactNode;
}
export const PageAppBar: FC<Props> = ({
  title,
  isOpen = false,
  isModal = true,
  showBack = true,
  handleClose = () => {},
  handleSave = () => {},
  renderForm
}) => {
  const theme = useTheme();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState<unknown | undefined>(undefined);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = useCallback((properties: { changedData: unknown; isFormValid: boolean }) => {
    setIsFormValid(properties.isFormValid);
    setFormData(properties.changedData);
  }, []);

  const appBar = isModal ? (
    <ModalAppBar
      title={title}
      isFormValid={isFormValid}
      formData={formData}
      onClose={handleClose}
      onSave={data => handleSave(data)}
    />
  ) : (
    <PageHeader
      title={title}
      isFormValid={isFormValid}
      formData={formData}
      onBack={handleClose}
      showBack={showBack}
      showSave={true}
      onSave={data => handleSave(data)}
    />
  );

  const formContent = renderForm({
    onChange: handleChange
  });

  return (
    <>
      {isModal && (
        <Dialog fullScreen={isMobile} open={isOpen} onClose={handleClose}>
          {appBar}
          <DialogContent>{formContent}</DialogContent>
        </Dialog>
      )}
      {!isModal && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {appBar}
          {formContent}
        </Box>
      )}
    </>
  );
};

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Fab, IconButton, Tooltip, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import { useAppDispatch } from '../../state/configureStore';
import { addToast } from '../../state/pageSlice';
import { CropModal } from '../cropModal/CropModal';

interface UploadSquareProps {
  onUpload?: (file?: Blob) => void;
  size?: number;
  maxSizeMB?: number;
  logoUrl?: string;
}
export const UploadImage: React.FC<UploadSquareProps> = ({ onUpload, size = 120, maxSizeMB = 2, logoUrl }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | undefined>(logoUrl);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      event.target.value = '';
      dispatch(addToast({ message: t('error.fileTooLarge', { maxSizeMB: maxSizeMB }), severity: 'error' }));
    } else {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setCropDialogOpen(true);
    }
  };

  useEffect(() => {
    setCroppedImageUrl(logoUrl);
  }, [logoUrl]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        onClick={handleClick}
        sx={{
          width: size,
          height: size,
          border: '2px dashed',
          borderColor: theme.palette.grey['400'],
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          title={t('common.selectImage')}
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        {croppedImageUrl && !cropDialogOpen ? (
          <>
            <img
              src={croppedImageUrl}
              alt={t('ariaLabel.cropped')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Tooltip title={t('ariaLabel.clear')}>
              <Fab
                color="primary"
                size="small"
                aria-label={t('ariaLabel.clear')}
                onClick={e => {
                  e.stopPropagation();
                  setCroppedImageUrl(undefined);
                  if (inputRef.current) inputRef.current.value = '';
                  if (onUpload) onUpload(undefined);
                }}
                sx={{
                  position: 'absolute',
                  top: -20,
                  zIndex: 9999,
                  right: -20
                }}
              >
                <CloseIcon fontSize="small" />
              </Fab>
            </Tooltip>
          </>
        ) : (
          <Tooltip title={t('ariaLabel.uploadImage')}>
            <IconButton color="primary" aria-label={t('ariaLabel.uploadImage')}>
              <AddIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <CropModal
        isOpen={cropDialogOpen}
        imageSrc={imageSrc}
        onClose={() => {
          setCropDialogOpen(false);
          if (inputRef.current) inputRef.current.value = '';
        }}
        onSave={(url: string, file: Blob) => {
          setCroppedImageUrl(url);
          if (onUpload) onUpload(file);
          setCropDialogOpen(false);
        }}
      />
    </Box>
  );
};

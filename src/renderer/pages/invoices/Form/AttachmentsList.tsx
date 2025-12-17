import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { Box, IconButton, ListItemText, Tooltip, Typography } from '@mui/material';
import { memo, useEffect, useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadImage } from '../../../shared/components/inputs/uploadImage/UploadImage';
import type { AttachmentForm, InvoiceFromData } from '../../../shared/types/invoice';
import { fromUint8Array, toUint8Array } from '../../../shared/utils/dataUrlFunctions';

interface Props {
  invoiceForm?: InvoiceFromData;
  onAttach: (attachment: AttachmentForm) => void;
  onClear: (id: number) => void;
}
const AttachmentsListComponent: FC<Props> = ({ invoiceForm, onAttach, onClear }) => {
  const { t } = useTranslation();

  const onUpload = async (file?: Blob, filename?: string, id?: number) => {
    if (file && filename) {
      const fileUnitArray = await toUint8Array(t, file);
      if (fileUnitArray)
        onAttach({
          data: fileUnitArray,
          fileSize: file.size,
          fileType: file.type,
          fileName: filename
        });
    } else if (!file && !filename && id) {
      onClear(id);
    }
  };

  const attachmentUrls = useMemo(() => {
    return (
      invoiceForm?.invoiceAttachments?.map(attachment => ({
        id: attachment.id,
        url: fromUint8Array(attachment.data, attachment.fileType) ?? undefined
      })) ?? []
    );
  }, [invoiceForm?.invoiceAttachments]);

  useEffect(() => {
    return () => {
      attachmentUrls.forEach(a => {
        if (a.url) URL.revokeObjectURL(a.url);
      });
    };
  }, [attachmentUrls]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'start',
        width: '100%',
        gap: 2,
        p: 2
      }}
    >
      <ListItemText
        primary={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Tooltip title={t('invoices.attachments')}>
              <IconButton size="small" data-drag-handle onMouseDown={e => e.stopPropagation()}>
                <PhotoLibraryIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography
              component="div"
              variant="body1"
              sx={{ fontWeight: 600, color: 'primary.main', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {t('invoices.attachments').toUpperCase()}
            </Typography>
          </Box>
        }
        disableTypography
        sx={{ m: 0 }}
        slotProps={{ primary: { sx: { fontWeight: 500, m: 0 } } }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          alignItems: 'start',
          width: '100%',
          gap: 1
        }}
      >
        {attachmentUrls.map(attachment => (
          <UploadImage
            key={attachment.id}
            onUpload={(file?: Blob, filename?: string) => onUpload(file, filename, attachment.id)}
            imgUrl={attachment.url}
            size={100}
            disableEdit={true}
          />
        ))}
        <UploadImage onUpload={onUpload} size={100} imgUrl={undefined} alwaysShowAddIcon={true} />
      </Box>
    </Box>
  );
};
export const AttachmentsList = memo(AttachmentsListComponent);

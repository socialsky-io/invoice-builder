import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onImport?: (file: File) => void;
  onExport?: () => void;
  onDownloadTemplate?: () => void;
}

const ImportExportButton: React.FC<Props> = ({ onImport, onExport, onDownloadTemplate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (action?: () => void) => {
    handleClose();
    action?.();
  };

  const handleImportClick = () => {
    handleClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    event.target.value = '';
  };

  return (
    <>
      <Button variant="text" onClick={handleClick}>
        {t('common.importExport')}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={handleImportClick}>
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.import')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleItemClick(onExport)}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.export')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleItemClick(onDownloadTemplate)}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.downloadTemplate')}</ListItemText>
        </MenuItem>
      </Menu>

      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
};

export default ImportExportButton;

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateFormat } from '../../../enums/dateFormat';

dayjs.extend(utc);

interface Props {
  label: string;
  value?: string;
  required?: boolean;
  error?: boolean;
  format: DateFormat;
  onChange?: (value?: string) => void;
}
export const Datepicker: React.FC<Props> = ({
  value,
  label,
  required = false,
  error = false,
  format,
  onChange = () => {}
}) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);

  useEffect(() => {
    if (typeof selectedValue !== 'undefined') onChange(selectedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        sx={{ width: '100%' }}
        label={label}
        value={value ? dayjs.utc(value) : null}
        format={format.toUpperCase()}
        onChange={newValue => {
          const utcValue = newValue ? newValue.utc() : null;
          setSelectedValue(utcValue?.toISOString());
        }}
        slotProps={{
          textField: {
            required: required,
            error: error,
            helperText: error ? t('common.fieldRequired') : '',
            onKeyDown: (e: React.KeyboardEvent) => {
              e.preventDefault();
            },
            InputProps: {
              readOnly: true
            }
          }
        }}
      />
    </LocalizationProvider>
  );
};

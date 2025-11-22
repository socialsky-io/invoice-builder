import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateFormat } from '../../enums/dateFormat';

dayjs.extend(utc);

interface Props {
  label: string;
  value?: string;
  format: DateFormat;
  onChange?: (value?: string) => void;
}
export const UTCDateRangePicker: React.FC<Props> = ({ label, value, format, onChange = () => {} }) => {
  const { t } = useTranslation();
  const [range, setRange] = useState<[string?, string?]>(
    value ? (value.split(',') as [string?, string?]) : [undefined, undefined]
  );

  useEffect(() => {
    if (range[0] && range[1]) {
      onChange(range.join(','));
    }
  }, range);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          alignItems: 'center',
          width: '100%'
        }}
      >
        <DatePicker
          label={`${t('common.from')} ${label}`}
          value={range[0] ? dayjs.utc(range[0]) : null}
          format={format}
          onChange={newValue => {
            const utcValue = newValue ? newValue.utc() : null;
            setRange([utcValue?.toISOString(), range[1]]);
          }}
        />
        <DatePicker
          label={`${t('common.to')} ${label}`}
          value={range[1] ? dayjs.utc(range[1]) : null}
          format={format}
          onChange={newValue => {
            const utcValue = newValue ? newValue.utc() : null;
            setRange([range[0], utcValue?.toISOString()]);
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

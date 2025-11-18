import { Autocomplete, Grid, TextField } from '@mui/material';
import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '../../hooks/useForm';
import { CURRENCY_FORMAT_ITEMS_ARRAY } from '../../state/constant';
import type { Currency, CurrencyFromData } from '../../types/currency';
import { getFormattedLabel } from '../../utils/functions';
import { validators } from '../../utils/validators';

interface Props {
  currency?: Currency;
  handleChange?: (data: { currency: CurrencyFromData; isFormValid: boolean }) => void;
}
export const Form: FC<Props> = ({ handleChange = () => {}, currency }) => {
  const { t } = useTranslation();
  const optionsCurrencyFormat = CURRENCY_FORMAT_ITEMS_ARRAY;
  const { form, setForm, update } = useForm<CurrencyFromData>({
    id: currency?.id,
    code: currency?.code ?? '',
    symbol: currency?.symbol ?? '',
    text: currency?.text ?? '',
    format: currency?.format ?? ''
  });
  const [errors, setErrors] = useState({
    code: false,
    symbol: false,
    text: false,
    format: false
  });

  const isFormatDisabled = form.code.trim() === '' || form.symbol.trim() === '';
  const hasSelectedFormat = form.format.trim() !== '';

  const validateField = (field: keyof typeof errors, value: string) => {
    if (
      !validators.required(value) &&
      (field === 'code' || field === 'symbol' || field === 'text' || field === 'format')
    ) {
      setErrors(e => ({ ...e, [field]: true }));
    } else {
      setErrors(e => ({ ...e, [field]: false }));
    }
  };

  useEffect(() => {
    setForm({
      id: currency?.id,
      code: currency?.code ?? '',
      symbol: currency?.symbol ?? '',
      text: currency?.text ?? '',
      format: currency?.format ?? ''
    });
  }, [currency]);

  useEffect(() => {
    const valid =
      form.code.trim() !== '' && form.symbol.trim() !== '' && form.text.trim() !== '' && form.format.trim() !== '';

    handleChange({
      currency: form,
      isFormValid: valid
    });
  }, [form, errors]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('currenciesModal.code')}
          fullWidth
          required
          value={form.code}
          error={errors.code}
          helperText={errors.code ? t('common.fieldRequired') : ''}
          onChange={e => {
            update('code', e.target.value);
            validateField('code', e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('currenciesModal.symbol')}
          fullWidth
          required
          value={form.symbol}
          error={errors.symbol}
          helperText={errors.symbol ? t('common.fieldRequired') : ''}
          onChange={e => {
            update('symbol', e.target.value);
            validateField('symbol', e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={t('currenciesModal.text')}
          fullWidth
          required
          value={form.text}
          error={errors.text}
          helperText={errors.text ? t('common.fieldRequired') : ''}
          onChange={e => {
            update('text', e.target.value);
            validateField('text', e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Autocomplete
          fullWidth
          disabled={isFormatDisabled}
          options={optionsCurrencyFormat}
          getOptionLabel={option => getFormattedLabel({ label: option.label, symbol: form.symbol, code: form.code })}
          disableClearable={hasSelectedFormat}
          value={optionsCurrencyFormat.find(opt => opt.value === form.format) ?? null}
          onChange={(_e, newValue) => {
            if (!newValue) return;
            update('format', newValue.value);
            validateField('format', newValue.value);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={option.value} {...rest}>
                {getFormattedLabel({ label: option.label, symbol: form.symbol, code: form.code })}
              </li>
            );
          }}
          renderInput={params => (
            <TextField
              {...params}
              error={errors.format}
              helperText={errors.format ? t('common.fieldRequired') : ''}
              label={t('currenciesModal.format')}
              required
            />
          )}
          freeSolo={false}
        />
      </Grid>
    </Grid>
  );
};

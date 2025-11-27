import { TextField } from '@mui/material';
import type { FC, ReactNode } from 'react';
import { NumericFormat } from 'react-number-format';
import { AmountFormat } from '../../../enums/amountFormat';
import { getFormattingMeta } from '../../../utils/formatFunctions';

interface Props {
  value?: number;
  onChange?: (valueInCents?: number) => void;
  amountFormat?: AmountFormat;
  label: string;
  required: boolean;
  error?: boolean;
  helperText?: ReactNode;
  min?: number;
}
export const AmountInput: FC<Props> = ({
  value,
  onChange = () => {},
  amountFormat = AmountFormat.enUS,
  label,
  required,
  error,
  min = 0,
  helperText
}) => {
  const { hasDecimal, thousand, decimal } = getFormattingMeta(amountFormat);

  return (
    <NumericFormat
      customInput={TextField}
      label={label}
      fullWidth
      min={min}
      error={error}
      helperText={helperText}
      required={required}
      value={value}
      thousandSeparator={thousand}
      decimalSeparator={hasDecimal ? decimal : undefined}
      decimalScale={hasDecimal ? 2 : 0}
      fixedDecimalScale={hasDecimal}
      allowNegative={false}
      onValueChange={values => {
        const { floatValue } = values;
        onChange(floatValue);
      }}
    />
  );
};

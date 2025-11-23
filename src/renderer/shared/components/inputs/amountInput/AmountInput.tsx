import { TextField } from '@mui/material';
import type { FC } from 'react';
import { NumericFormat } from 'react-number-format';
import { AmountFormat } from '../../../enums/amountFormat';
import { getFormattingMeta } from '../../../utils/formatFunctions';

interface Props {
  value: number;
  onChange?: (valueInCents: number) => void;
  amountFormat?: AmountFormat;
  label: string;
  required: boolean;
}
export const AmountInput: FC<Props> = ({
  value,
  onChange = () => {},
  amountFormat = AmountFormat.enUS,
  label,
  required
}) => {
  const { hasDecimal, thousand, decimal } = getFormattingMeta(amountFormat);

  return (
    <NumericFormat
      customInput={TextField}
      label={label}
      fullWidth
      required={required}
      value={value}
      thousandSeparator={thousand}
      decimalSeparator={hasDecimal ? decimal : undefined}
      decimalScale={hasDecimal ? 2 : 0}
      fixedDecimalScale={hasDecimal}
      allowNegative={false}
      onValueChange={values => {
        const { floatValue } = values;
        onChange(floatValue ?? 0);
      }}
    />
  );
};

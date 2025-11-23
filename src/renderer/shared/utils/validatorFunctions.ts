export const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v: string) => /^\+[1-9]\d{6,14}$/.test(v),
  required: (v: string) => v.trim() !== ''
} as const;

export const validateOnlyNumbersLetters = (value: string) => {
  const isValid = /^[a-zA-Z0-9]*$/.test(value);
  return isValid;
};

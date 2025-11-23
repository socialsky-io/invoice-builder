import type { TFunction } from 'i18next';

export const uint8ArrayToDataUrl = (data: Uint8Array, mimeType = 'image/jpeg'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffer = new Uint8Array(data).buffer;
    const blob = new Blob([buffer], { type: mimeType });
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const isDataUrl = (value: unknown): value is string => {
  return typeof value === 'string' && /^data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
};

export const fromUint8Array = (data?: Uint8Array | null, type = 'image/jpeg'): string | null => {
  if (!data) return null;

  const buffer =
    data.buffer instanceof ArrayBuffer
      ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      : new ArrayBuffer(0);

  const blob = new Blob([buffer], { type });
  return URL.createObjectURL(blob);
};

export const toUint8Array = async (
  t: TFunction<'translation', undefined>,
  input: Blob | File | ArrayBuffer | Uint8Array | null
) => {
  if (!input) return null;

  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (input instanceof Blob) {
    const arrayBuffer = await input.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  throw new Error(t('error.unsupportedImage'));
};

// Leaving logos column out of excel
// export const dataUrlToBlob = (dataUrl: string): Blob => {
//   try {
//     const base64Index = dataUrl.indexOf(',') + 1;
//     const base64 = dataUrl.slice(base64Index);
//     const mimeTypeMatch = dataUrl.match(/^data:(.*?);base64,/);
//     const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

//     const byteCharacters = atob(base64);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     return new Blob([byteArray], { type: mimeType });
//   } catch (error) {
//     throw new Error(t("error.invalidLogo"));
//   }
// };

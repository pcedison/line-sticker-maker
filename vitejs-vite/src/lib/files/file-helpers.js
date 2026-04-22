export const filenameWithoutExtension = (filename) =>
  filename.replace(/\.[^/.]+$/, '');

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = () => reject(new Error(`讀取檔案失敗：${file.name}`));
    reader.readAsDataURL(file);
  });

export const createImageQueueItems = async (files) => {
  const items = await Promise.all(
    files.map(async (file) => ({
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      file,
      filename: filenameWithoutExtension(file.name),
      originalData: await fileToDataUrl(file),
      resultData: null,
      status: 'ready',
      errorMessage: '',
    }))
  );

  return items;
};

export const dataUrlToBase64 = (dataUrl) => {
  const [, base64 = ''] = dataUrl.split(',');
  return base64;
};

export const sanitizeFilenameSegment = (value) => {
  const normalized = String(value).trim().replace(/[<>:"/\\|?*]+/g, '_');
  return normalized || 'file';
};

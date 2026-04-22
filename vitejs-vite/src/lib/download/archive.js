import JSZip from 'jszip';
import { sanitizeFilenameSegment } from '../files/file-helpers';
import { downloadBlob } from './browser';

export const downloadZip = async ({ archiveName, files }) => {
  const zip = new JSZip();

  for (const file of files) {
    const base64 = file.dataUrl.split(',')[1] || '';
    zip.file(sanitizeFilenameSegment(file.name), base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, sanitizeFilenameSegment(archiveName));
};

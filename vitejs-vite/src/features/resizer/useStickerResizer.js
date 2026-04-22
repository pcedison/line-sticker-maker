import { useState } from 'react';
import { LINE_MAIN_SIZE, LINE_TAB_SIZE } from '../../lib/constants/line';
import { downloadDataUrl } from '../../lib/download/browser';
import {
  filenameWithoutExtension,
  fileToDataUrl,
} from '../../lib/files/file-helpers';
import { resizeAndPadImage } from '../../lib/image/canvas';

export const useStickerResizer = () => {
  const [image, setImage] = useState(null);
  const [filename, setFilename] = useState('');
  const [options, setOptions] = useState({ main: true, tab: true });

  const applyFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setImage(dataUrl);
    setFilename(filenameWithoutExtension(file.name));
  };

  const toggleOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const exportImages = async () => {
    if (!image) {
      return;
    }

    if (options.main) {
      const mainDataUrl = await resizeAndPadImage(
        image,
        LINE_MAIN_SIZE.width,
        LINE_MAIN_SIZE.height,
        true
      );

      downloadDataUrl(
        mainDataUrl,
        `${filename || 'sticker'}_Main_${LINE_MAIN_SIZE.width}x${LINE_MAIN_SIZE.height}.png`
      );
    }

    if (options.tab) {
      const tabDataUrl = await resizeAndPadImage(
        image,
        LINE_TAB_SIZE.width,
        LINE_TAB_SIZE.height,
        false
      );

      downloadDataUrl(
        tabDataUrl,
        `${filename || 'sticker'}_Tab_${LINE_TAB_SIZE.width}x${LINE_TAB_SIZE.height}.png`
      );
    }
  };

  return {
    image,
    filename,
    options,
    applyFile,
    toggleOption,
    exportImages,
  };
};

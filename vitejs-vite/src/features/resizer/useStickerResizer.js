import { useState } from 'react';
import { useNotices } from '../../app/useNotices';
import { LINE_MAIN_SIZE, LINE_TAB_SIZE } from '../../lib/constants/line';
import { downloadDataUrl } from '../../lib/download/browser';
import {
  filenameWithoutExtension,
  fileToDataUrl,
} from '../../lib/files/file-helpers';
import { resizeAndPadImage } from '../../lib/image/canvas';

export const useStickerResizer = () => {
  const { notify } = useNotices();
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
    notify({
      title: '貼圖成品已載入',
      message: '可以直接輸出 Main 與 Tab 尺寸。',
      tone: 'success',
      duration: 2400,
    });
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

    notify({
      title: '尺寸檔案已輸出',
      message: '所選規格的 PNG 檔案已開始下載。',
      tone: 'success',
      duration: 2600,
    });
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

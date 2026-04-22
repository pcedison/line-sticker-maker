import { startTransition, useRef, useState } from 'react';
import {
  BACKGROUND_MODES,
  BACKGROUND_MODE_COPY,
  BG_BATCH_LIMIT,
} from '../../lib/constants/line';
import { downloadZip } from '../../lib/download/archive';
import { downloadDataUrl } from '../../lib/download/browser';
import {
  createImageQueueItems,
  dataUrlToBase64,
} from '../../lib/files/file-helpers';
import { generateImageWithReference } from '../../lib/gemini/client';
import { processGreenScreen } from '../../lib/image/canvas';

const semanticPrompts = {
  ai_character:
    'CRITICAL INSTRUCTION: Re-draw the provided image exactly. ONLY keep the main character. REMOVE all text, typography, speech bubbles, tables, props, and background environments. Place the character on a purely solid bright green (#00FF00) background.',
  ai_text:
    'CRITICAL INSTRUCTION: Re-draw the provided image exactly. Keep the main character AND the text/typography. REMOVE all tables, props, and background environments. Place the remaining elements on a purely solid bright green (#00FF00) background.',
  ai_props:
    'CRITICAL INSTRUCTION: Re-draw the provided image exactly. Keep the main character AND the objects they are interacting with. REMOVE all text and speech bubbles. REMOVE the background environment. Place everything on a purely solid bright green (#00FF00) background.',
  ai_all:
    'CRITICAL INSTRUCTION: Re-draw the provided image exactly. Keep the main character, the text, and the interactive props. ONLY remove the background environment. Place the remaining elements on a purely solid bright green (#00FF00) background.',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useBgRemover = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgMode, setBgMode] = useState(BACKGROUND_MODES[0].id);
  const [errorMsg, setErrorMsg] = useState('');

  const stopRequestedRef = useRef(false);

  const applyFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (files.length + selectedFiles.length > BG_BATCH_LIMIT) {
      setErrorMsg(`超過上限 ${BG_BATCH_LIMIT} 張。你目前已選 ${files.length} 張。`);
      return;
    }

    const queueItems = await createImageQueueItems(selectedFiles);

    startTransition(() => {
      setFiles((current) => [...current, ...queueItems]);
      setErrorMsg('');
    });
  };

  const clearFiles = () => {
    if (isProcessing) {
      return;
    }

    setFiles([]);
    setErrorMsg('');
  };

  const requestStopProcessing = () => {
    stopRequestedRef.current = true;
  };

  const setItemState = (id, patch) => {
    setFiles((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const processQueue = async () => {
    if (files.length === 0) {
      return;
    }

    stopRequestedRef.current = false;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      for (const item of files) {
        if (stopRequestedRef.current) {
          break;
        }

        if (item.status === 'done') {
          continue;
        }

        setItemState(item.id, { status: 'processing' });

        try {
          let sourceDataUrl = item.originalData;

          if (bgMode.startsWith('ai_')) {
            sourceDataUrl = await generateImageWithReference({
              prompt: semanticPrompts[bgMode],
              base64Data: dataUrlToBase64(item.originalData),
            });
          }

          await wait(40);

          const resultData = await processGreenScreen(sourceDataUrl);

          setItemState(item.id, {
            status: 'done',
            resultData,
            errorMessage: '',
          });
        } catch (error) {
          setItemState(item.id, {
            status: 'error',
            errorMessage: error.message,
          });
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadItem = (id) => {
    const item = files.find((entry) => entry.id === id);

    if (!item?.resultData) {
      return;
    }

    downloadDataUrl(item.resultData, `${item.filename}_noBG.png`);
  };

  const downloadAll = async () => {
    const completed = files.filter((item) => item.status === 'done');

    if (completed.length === 0) {
      return;
    }

    await downloadZip({
      archiveName: `Removed_Backgrounds_${BACKGROUND_MODE_COPY[bgMode]}.zip`,
      files: completed.map((item) => ({
        name: `${item.filename}_noBG.png`,
        dataUrl: item.resultData,
      })),
    });
  };

  const stats = {
    total: files.length,
    done: files.filter((item) => item.status === 'done').length,
    processing: files.filter((item) => item.status === 'processing').length,
    error: files.filter((item) => item.status === 'error').length,
  };

  return {
    files,
    isProcessing,
    bgMode,
    setBgMode,
    errorMsg,
    applyFiles,
    clearFiles,
    processQueue,
    requestStopProcessing,
    downloadItem,
    downloadAll,
    stats,
  };
};

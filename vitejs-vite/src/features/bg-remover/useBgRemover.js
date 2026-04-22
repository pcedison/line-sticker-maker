import { startTransition, useRef, useState } from 'react';
import { useNotices } from '../../app/useNotices';
import { HAS_GEMINI_API_KEY } from '../../lib/config/env';
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
const DEFAULT_BG_MODE = HAS_GEMINI_API_KEY ? BACKGROUND_MODES[0].id : 'classic';

export const useBgRemover = () => {
  const { notify } = useNotices();
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgMode, setBgMode] = useState(DEFAULT_BG_MODE);
  const [errorMsg, setErrorMsg] = useState('');
  const [runState, setRunState] = useState('idle');

  const stopRequestedRef = useRef(false);

  const applyFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (files.length + selectedFiles.length > BG_BATCH_LIMIT) {
      const message = `超過上限 ${BG_BATCH_LIMIT} 張。你目前已選 ${files.length} 張。`;
      setErrorMsg(message);
      notify({ title: '批次上限超出', message, tone: 'error' });
      return;
    }

    const queueItems = await createImageQueueItems(selectedFiles);

    startTransition(() => {
      setFiles((current) => [...current, ...queueItems]);
      setErrorMsg('');
    });

    notify({
      title: '圖片已加入佇列',
      message: `新增 ${queueItems.length} 張圖片，現在共 ${files.length + queueItems.length} 張。`,
      tone: 'success',
      duration: 2600,
    });
  };

  const clearFiles = () => {
    if (isProcessing) {
      return;
    }

    setFiles([]);
    setErrorMsg('');
    setRunState('idle');
    notify({
      title: '已清空去背佇列',
      message: '可以重新選擇一批新的圖片。',
      tone: 'info',
      duration: 2400,
    });
  };

  const requestStopProcessing = () => {
    stopRequestedRef.current = true;
    notify({
      title: '已收到停止請求',
      message: '系統會在完成目前這張圖後停止後續處理。',
      tone: 'info',
    });
  };

  const setItemState = (id, patch) => {
    setFiles((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const updateBgMode = (nextMode) => {
    if (!HAS_GEMINI_API_KEY && nextMode.startsWith('ai_')) {
      setBgMode('classic');
      return;
    }

    setBgMode(nextMode);
  };

  const processQueue = async () => {
    if (files.length === 0) {
      return;
    }

    if (!HAS_GEMINI_API_KEY && bgMode.startsWith('ai_')) {
      const message =
        '目前未設定 VITE_GEMINI_API_KEY，AI 語意模式暫時不可用。你仍可改用原版綠幕直出。';
      setErrorMsg(message);
      notify({ title: '缺少 Gemini API 金鑰', message, tone: 'error' });
      return;
    }

    stopRequestedRef.current = false;
    setIsProcessing(true);
    setErrorMsg('');
    setRunState('running');

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
      const stopped = stopRequestedRef.current;
      setRunState(stopped ? 'stopped' : 'completed');

      if (stopped) {
        notify({
          title: '批次去背已停止',
          message: '目前已保留已完成項目，未處理項目仍留在佇列中。',
          tone: 'info',
        });
      } else {
        notify({
          title: '批次去背完成',
          message: '已完成所有可處理項目，你可以直接下載結果。',
          tone: 'success',
        });
      }
    }
  };

  const downloadItem = (id) => {
    const item = files.find((entry) => entry.id === id);

    if (!item?.resultData) {
      return;
    }

    downloadDataUrl(item.resultData, `${item.filename}_noBG.png`);
    notify({
      title: '已觸發下載',
      message: `正在下載 ${item.filename}_noBG.png`,
      tone: 'info',
      duration: 2400,
    });
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

    notify({
      title: 'ZIP 已開始下載',
      message: '去背完成的圖片會一起打包下載。',
      tone: 'success',
      duration: 2600,
    });
  };

  const settledCount =
    files.filter((item) => item.status === 'done').length +
    files.filter((item) => item.status === 'error').length;

  const stats = {
    total: files.length,
    done: files.filter((item) => item.status === 'done').length,
    processing: files.filter((item) => item.status === 'processing').length,
    error: files.filter((item) => item.status === 'error').length,
    ready: files.filter((item) => item.status === 'ready').length,
    remaining: files.filter(
      (item) => item.status === 'ready' || item.status === 'processing'
    ).length,
    progressPercent:
      files.length === 0 ? 0 : Math.round((settledCount / files.length) * 100),
  };

  return {
    hasGeminiApiKey: HAS_GEMINI_API_KEY,
    files,
    isProcessing,
    bgMode,
    setBgMode: updateBgMode,
    errorMsg,
    runState,
    applyFiles,
    clearFiles,
    processQueue,
    requestStopProcessing,
    downloadItem,
    downloadAll,
    stats,
  };
};

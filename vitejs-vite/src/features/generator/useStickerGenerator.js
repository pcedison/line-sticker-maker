import { startTransition, useRef, useState } from 'react';
import { useNotices } from '../../app/useNotices';
import { HAS_GEMINI_API_KEY } from '../../lib/config/env';
import {
  DEFAULT_STICKER_BACKGROUND_MODE,
  DEFAULT_STICKER_THEME,
  DEFAULT_STICKER_STYLE,
  DEFAULT_STICKER_TEXTS,
  STICKER_BACKGROUND_MODE_COPY,
} from '../../lib/constants/line';
import { downloadZip } from '../../lib/download/archive';
import { downloadDataUrl } from '../../lib/download/browser';
import {
  dataUrlToBase64,
  filenameWithoutExtension,
  fileToDataUrl,
} from '../../lib/files/file-helpers';
import {
  buildStickerImagePrompt,
  generateImageWithReference,
  generateStickerCopyPlan,
} from '../../lib/gemini/client';
import {
  prepareStickerSetFromGrid,
} from '../../lib/image/canvas';
import demoHeroUrl from '../../assets/hero.png';

const createDefaultTexts = () => [...DEFAULT_STICKER_TEXTS];
const HISTORY_LIMIT = 6;

export const useStickerGenerator = () => {
  const { notify } = useNotices();
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceFileName, setSourceFileName] = useState('');
  const [styleInput, setStyleInput] = useState(DEFAULT_STICKER_STYLE);
  const [texts, setTexts] = useState(createDefaultTexts);
  const [backgroundMode, setBackgroundMode] = useState(
    DEFAULT_STICKER_BACKGROUND_MODE
  );
  const [themeInput, setThemeInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGrid, setGeneratedGrid] = useState(null);
  const [splitImages, setSplitImages] = useState([]);
  const [preparedImages, setPreparedImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [generationHistory, setGenerationHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const abortControllerRef = useRef(null);

  const resetOutputs = () => {
    setGeneratedGrid(null);
    setSplitImages([]);
    setPreparedImages([]);
  };

  const applySourceFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setSourceImage(dataUrl);
    setSourceFileName(filenameWithoutExtension(file.name));
    setErrorMsg('');
    setGenerationHistory([]);
    setSelectedHistoryId(null);
    resetOutputs();
    notify({
      title: '角色圖已載入',
      message: '可以開始規劃四句貼圖文案與整體風格。',
      tone: 'success',
      duration: 2400,
    });
  };

  const clearSourceImage = () => {
    setSourceImage(null);
    setSourceFileName('');
    setErrorMsg('');
    setGenerationHistory([]);
    setSelectedHistoryId(null);
    resetOutputs();
    notify({
      title: '角色圖已清除',
      message: '工作區已重設，隨時可以上傳新的角色圖。',
      tone: 'info',
      duration: 2200,
    });
  };

  const loadDemoSource = async () => {
    const response = await fetch(demoHeroUrl);
    const blob = await response.blob();
    const file = new File([blob], 'hero.png', {
      type: blob.type || 'image/png',
    });

    await applySourceFile(file);
    setThemeInput(DEFAULT_STICKER_THEME);
    setStyleInput(DEFAULT_STICKER_STYLE);
    setTexts(createDefaultTexts());
    setBackgroundMode(DEFAULT_STICKER_BACKGROUND_MODE);
    notify({
      title: '測試素材已載入',
      message: '已套用內建角色圖與測試主題，可直接驗證 AI 流程。',
      tone: 'info',
      duration: 2600,
    });
  };

  const updateText = (index, value) => {
    setTexts((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const generateInspiration = async () => {
    if (!HAS_GEMINI_API_KEY) {
      const message =
        '尚未設定 VITE_GEMINI_API_KEY，暫時無法使用 AI 文案企劃。';
      setErrorMsg(message);
      notify({ title: '缺少 Gemini API 金鑰', message, tone: 'error' });
      return;
    }

    if (!themeInput.trim()) {
      return;
    }

    setIsThinking(true);
    setErrorMsg('');

    try {
      const result = await generateStickerCopyPlan({ theme: themeInput.trim() });

      if (Array.isArray(result.texts) && result.texts.length === 4) {
        setTexts(result.texts);
      }

      if (result.style) {
        setStyleInput(result.style);
      }

      notify({
        title: 'AI 文案企劃完成',
        message: '已更新推薦風格與四句貼圖文字。',
        tone: 'success',
      });
    } catch (error) {
      setErrorMsg(error.message);
      notify({
        title: 'AI 文案企劃失敗',
        message: error.message,
        tone: 'error',
      });
    } finally {
      setIsThinking(false);
    }
  };

  const startGeneration = async (isFollowUp = false) => {
    if (!HAS_GEMINI_API_KEY) {
      const message =
        '尚未設定 VITE_GEMINI_API_KEY，暫時無法生成四宮格貼圖。';
      setErrorMsg(message);
      notify({ title: '缺少 Gemini API 金鑰', message, tone: 'error' });
      return;
    }

    if (!sourceImage) {
      setErrorMsg('請先上傳角色圖片作為參考。');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    if (!isFollowUp) {
      resetOutputs();
    }

    abortControllerRef.current = new AbortController();
    notify({
      title: isFollowUp ? '正在追加生成' : '正在生成四宮格',
      message: 'AI 會依照角色圖、風格與文案輸出新的 2x2 貼圖網格。',
      tone: 'info',
      duration: 2200,
    });

    try {
      const finalPrompt = buildStickerImagePrompt({
        style: styleInput,
        texts,
        backgroundMode,
        isFollowUp,
      });
      const outputImage = await generateImageWithReference({
        prompt: finalPrompt,
        base64Data: dataUrlToBase64(sourceImage),
        signal: abortControllerRef.current.signal,
      });
      const { previewGrid, stickers } = await prepareStickerSetFromGrid(
        outputImage,
        texts,
        backgroundMode
      );

      setGeneratedGrid(previewGrid);
      setPreparedImages(stickers);
      setSplitImages([]);
      const historyItem = {
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        style: styleInput,
        texts: [...texts],
        backgroundMode,
        grid: previewGrid,
        splitImages: stickers,
        sourceFileName,
      };

      setGenerationHistory((current) => [historyItem, ...current].slice(0, HISTORY_LIMIT));
      setSelectedHistoryId(historyItem.id);
      notify({
        title: '四宮格已生成',
        message: isFollowUp
          ? `已新增一個同主題的新版本，並套用${STICKER_BACKGROUND_MODE_COPY[backgroundMode]}流程。`
          : `預覽已套用${STICKER_BACKGROUND_MODE_COPY[backgroundMode]}流程與可控繁中文字覆蓋。`,
        tone: 'success',
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrorMsg(error.message);
        notify({
          title: '生成失敗',
          message: error.message,
          tone: 'error',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    notify({
      title: '已停止生成',
      message: '目前請求已取消，你可以調整內容後重新生成。',
      tone: 'info',
    });
  };

  const splitGeneratedGrid = async () => {
    if (!generatedGrid || preparedImages.length === 0) {
      return;
    }

    setErrorMsg('');

    try {
      startTransition(() => {
        setSplitImages(preparedImages);
      });

      notify({
        title: '切圖完成',
        message: '四張 LINE 規格貼圖已完成繁中文字覆蓋並準備好下載。',
        tone: 'success',
      });
    } catch (error) {
      setErrorMsg(error.message);
      notify({
        title: '切圖失敗',
        message: error.message,
        tone: 'error',
      });
    }
  };

  const downloadSticker = (index) => {
    const image = splitImages[index];

    if (!image) {
      return;
    }

    const label = texts[index] || `圖${index + 1}`;
    downloadDataUrl(image, `${sourceFileName || 'character'}__${label}.png`);
    notify({
      title: '已觸發下載',
      message: `正在下載 ${sourceFileName || 'character'}__${label}.png`,
      tone: 'info',
      duration: 2200,
    });
  };

  const downloadAll = async () => {
    if (splitImages.length === 0) {
      return;
    }

    await downloadZip({
      archiveName: `${sourceFileName || 'stickers'}_all.zip`,
      files: splitImages.map((image, index) => ({
        name: `${sourceFileName || 'character'}__${texts[index] || `圖${index + 1}`}.png`,
        dataUrl: image,
      })),
    });

    notify({
      title: 'ZIP 已開始下載',
      message: '四張貼圖會一起打包成 ZIP。',
      tone: 'success',
      duration: 2400,
    });
  };

  const restoreHistoryItem = (id) => {
    const item = generationHistory.find((entry) => entry.id === id);

    if (!item) {
      return;
    }

    setStyleInput(item.style || DEFAULT_STICKER_STYLE);
    setTexts(item.texts?.length === 4 ? [...item.texts] : createDefaultTexts());
    setBackgroundMode(item.backgroundMode || DEFAULT_STICKER_BACKGROUND_MODE);
    setGeneratedGrid(item.grid || null);
    setPreparedImages(item.splitImages || []);
    setSplitImages([]);
    setSelectedHistoryId(item.id);
    setErrorMsg('');
    notify({
      title: '已切換到歷史版本',
      message: '你可以直接重新切圖，或在此基礎上繼續追加生成。',
      tone: 'info',
      duration: 2400,
    });
  };

  return {
    hasGeminiApiKey: HAS_GEMINI_API_KEY,
    sourceImage,
    sourceFileName,
    styleInput,
    setStyleInput,
    texts,
    backgroundMode,
    setBackgroundMode,
    themeInput,
    setThemeInput,
    isThinking,
    isGenerating,
    generatedGrid,
    splitImages,
    errorMsg,
    generationHistory,
    selectedHistoryId,
    applySourceFile,
    clearSourceImage,
    loadDemoSource,
    updateText,
    generateInspiration,
    startGeneration,
    stopGeneration,
    splitGeneratedGrid,
    downloadSticker,
    downloadAll,
    restoreHistoryItem,
  };
};

import { startTransition, useRef, useState } from 'react';
import {
  DEFAULT_STICKER_STYLE,
  DEFAULT_STICKER_TEXTS,
} from '../../lib/constants/line';
import { downloadZip } from '../../lib/download/archive';
import { downloadDataUrl } from '../../lib/download/browser';
import {
  dataUrlToBase64,
  filenameWithoutExtension,
  fileToDataUrl,
} from '../../lib/files/file-helpers';
import {
  generateImageWithReference,
  generateStickerCopyPlan,
} from '../../lib/gemini/client';
import {
  cropAndResizeForLineSticker,
  splitGridIntoStickers,
} from '../../lib/image/canvas';

const createDefaultTexts = () => [...DEFAULT_STICKER_TEXTS];

export const useStickerGenerator = () => {
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceFileName, setSourceFileName] = useState('');
  const [styleInput, setStyleInput] = useState(DEFAULT_STICKER_STYLE);
  const [texts, setTexts] = useState(createDefaultTexts);
  const [themeInput, setThemeInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGrid, setGeneratedGrid] = useState(null);
  const [splitImages, setSplitImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const abortControllerRef = useRef(null);

  const resetOutputs = () => {
    setGeneratedGrid(null);
    setSplitImages([]);
  };

  const applySourceFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setSourceImage(dataUrl);
    setSourceFileName(filenameWithoutExtension(file.name));
    setErrorMsg('');
    resetOutputs();
  };

  const clearSourceImage = () => {
    setSourceImage(null);
    setSourceFileName('');
    setErrorMsg('');
    resetOutputs();
  };

  const updateText = (index, value) => {
    setTexts((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const generateInspiration = async () => {
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
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsThinking(false);
    }
  };

  const startGeneration = async (isFollowUp = false) => {
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

    const basePrompt = `CRITICAL INSTRUCTION: You MUST generate a SINGLE image consisting of EXACTLY a 2x2 grid (4 equal square panels). Do NOT generate just one single picture.
Subject: The character from the reference image.
Style: ${styleInput}
Format: A sticker sheet divided into four distinct sections.

Panel 1 (Top-Left): Character acting out "${texts[0]}". Add the text "${texts[0]}" in Traditional Chinese.
Panel 2 (Top-Right): Character acting out "${texts[1]}". Add the text "${texts[1]}" in Traditional Chinese.
Panel 3 (Bottom-Left): Character acting out "${texts[2]}". Add the text "${texts[2]}" in Traditional Chinese.
Panel 4 (Bottom-Right): Character acting out "${texts[3]}". Add the text "${texts[3]}" in Traditional Chinese.

Make the character's poses, expressions, and environments completely different in each panel. Ensure clear boundaries between the four squares.`;

    const finalPrompt = isFollowUp
      ? `${basePrompt}
Note: Make sure these actions are completely different from the previous generation.`
      : basePrompt;

    try {
      const outputImage = await generateImageWithReference({
        prompt: finalPrompt,
        base64Data: dataUrlToBase64(sourceImage),
        signal: abortControllerRef.current.signal,
      });

      setGeneratedGrid(outputImage);
      setSplitImages([]);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrorMsg(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
  };

  const splitGeneratedGrid = async () => {
    if (!generatedGrid) {
      return;
    }

    setErrorMsg('');

    try {
      const rawPieces = await splitGridIntoStickers(generatedGrid);
      const croppedPieces = await Promise.all(
        rawPieces.map((piece) => cropAndResizeForLineSticker(piece))
      );

      startTransition(() => {
        setSplitImages(croppedPieces);
      });
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const downloadSticker = (index) => {
    const image = splitImages[index];

    if (!image) {
      return;
    }

    const label = texts[index] || `圖${index + 1}`;
    downloadDataUrl(image, `${sourceFileName || 'character'}__${label}.png`);
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
  };

  return {
    sourceImage,
    sourceFileName,
    styleInput,
    setStyleInput,
    texts,
    themeInput,
    setThemeInput,
    isThinking,
    isGenerating,
    generatedGrid,
    splitImages,
    errorMsg,
    applySourceFile,
    clearSourceImage,
    updateText,
    generateInspiration,
    startGeneration,
    stopGeneration,
    splitGeneratedGrid,
    downloadSticker,
    downloadAll,
  };
};

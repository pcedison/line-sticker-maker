import { GEMINI_API_KEY } from '../config/env';
import {
  buildStickerCopyPrompt,
  buildStickerGridPrompt,
} from './sticker-prompts';

const GEMINI_MODELS = {
  text: 'gemini-2.5-flash',
  image: 'gemini-3.1-flash-image-preview',
};

const requireGeminiApiKey = () => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      '尚未設定 Gemini API 金鑰。請在 vitejs-vite/.env 中加入 VITE_GEMINI_API_KEY。'
    );
  }
};

const buildEndpoint = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const parseApiErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return (
      data?.error?.message ||
      `Gemini API 請求失敗（${response.status} ${response.statusText}）`
    );
  } catch {
    return `Gemini API 請求失敗（${response.status} ${response.statusText}）`;
  }
};

const requestGemini = async ({ model, payload, signal }) => {
  requireGeminiApiKey();

  const response = await fetch(buildEndpoint(model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response));
  }

  return response.json();
};

const normalizeStickerText = (value) =>
  String(value)
    .trim()
    .replace(/\s+/g, '')
    .replace(/[A-Za-z0-9]/g, '');

const parseStickerCopyPlan = (textResponse) => {
  const normalized = textResponse
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');

  const parsed = JSON.parse(normalized);

  if (!Array.isArray(parsed?.texts)) {
    throw new Error('缺少 texts 陣列');
  }

  const texts = parsed.texts
    .map((value) => normalizeStickerText(value))
    .filter(Boolean)
    .slice(0, 4);

  if (texts.length !== 4) {
    throw new Error('texts 長度不是 4');
  }

  if (new Set(texts).size !== texts.length) {
    throw new Error('texts 內容重複');
  }

  if (
    texts.some(
      (text) => text.length < 2 || text.length > 6 || /[A-Za-z0-9]/.test(text)
    )
  ) {
    throw new Error('texts 不符合繁中文字數規則');
  }

  const style =
    typeof parsed.style === 'string' ? parsed.style.trim().replace(/\s+/g, ' ') : '';

  if (!style) {
    throw new Error('缺少 style');
  }

  return { style, texts };
};

export const generateStickerCopyPlan = async ({ theme, signal }) => {
  const prompt = buildStickerCopyPrompt(theme);
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await requestGemini({
        model: GEMINI_MODELS.text,
        signal,
        payload: {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 256,
            thinkingConfig: {
              thinkingBudget: 0,
            },
            responseSchema: {
              type: 'OBJECT',
              required: ['style', 'texts'],
              properties: {
                style: {
                  type: 'STRING',
                },
                texts: {
                  type: 'ARRAY',
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: 'STRING',
                  },
                },
              },
            },
          },
        },
      });

      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Gemini 未回傳可用的文案 JSON。');
      }

      return parseStickerCopyPlan(textResponse);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    lastError?.message ||
      'Gemini 文案結果格式不正確，請重試或縮短主題描述。預期需要 4 句文字與 1 個 style。'
  );
};

export const generateImageWithReference = async ({
  prompt,
  base64Data,
  signal,
}) => {
  const data = await requestGemini({
    model: GEMINI_MODELS.image,
    signal,
    payload: {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/png', data: base64Data } },
          ],
        },
      ],
      generationConfig: { responseModalities: ['IMAGE'] },
    },
  });

  const imageData = data?.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  )?.inlineData?.data;

  if (!imageData) {
    throw new Error('Gemini 沒有回傳可用圖片，請調整提示詞或換一張參考圖重試。');
  }

  return `data:image/png;base64,${imageData}`;
};

export const buildStickerImagePrompt = ({ style, texts, isFollowUp = false }) =>
  buildStickerGridPrompt({ style, texts, isFollowUp });

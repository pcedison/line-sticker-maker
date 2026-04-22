import { GEMINI_API_KEY } from '../config/env';

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

export const generateStickerCopyPlan = async ({ theme, signal }) => {
  const prompt = `你是一個專業的 Line 貼圖文案企劃。請根據主題「${theme}」，想出 4 句實用、有趣、簡短（每句建議 2~5 個字）的貼圖文字。
另外，推薦一個適合這個主題的繪圖風格（例如：日系水彩、搞怪美式、可愛萌寵）。
請嚴格輸出 JSON 格式，不要包含其他說明文字，格式如下：
{
  "style": "推薦的風格",
  "texts": ["第一句", "第二句", "第三句", "第四句"]
}`;

  const data = await requestGemini({
    model: GEMINI_MODELS.text,
    signal,
    payload: {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    },
  });

  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('Gemini 未回傳可用的文案 JSON。');
  }

  const normalized = textResponse
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '');

  try {
    const parsed = JSON.parse(normalized);

    if (!Array.isArray(parsed?.texts)) {
      throw new Error('缺少 texts 陣列');
    }

    const texts = parsed.texts
      .map((value) => String(value).trim())
      .filter(Boolean)
      .slice(0, 4);

    if (texts.length !== 4) {
      throw new Error('texts 長度不是 4');
    }

    return {
      style: typeof parsed.style === 'string' ? parsed.style.trim() : '',
      texts,
    };
  } catch {
    throw new Error(
      'Gemini 文案結果格式不正確，請重試或縮短主題描述。預期需要 4 句文字與 1 個 style。'
    );
  }
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

const joinTexts = (texts) => texts.map((text) => `「${text}」`).join('、');

export const buildStickerCopyPrompt = (theme) => `你是一個專業的 LINE 貼圖企劃與文案編輯。
請根據主題「${theme}」，產出 4 句貼圖短句與 1 個建議風格。

硬性規則：
1. texts 必須剛好 4 句，且每句為繁體中文常用貼圖短句。
2. 每句建議 2 到 5 個字，最長不要超過 6 個字。
3. 不要輸出英文、拼音、阿拉伯數字、emoji、井號、斜線。
4. 4 句內容不可重複，語氣要有明確差異，適合日常聊天。
5. style 必須是清楚可執行的畫風描述，請用繁體中文。

請嚴格輸出 JSON，不要加任何其他說明文字，格式如下：
{
  "style": "推薦的風格",
  "texts": ["第一句", "第二句", "第三句", "第四句"]
}`;

export const buildStickerGridPrompt = ({
  style,
  texts,
  backgroundMode,
  isFollowUp = false,
}) => {
  const panelPrompts = texts
    .map(
      (text, index) =>
        `Panel ${index + 1}: 以「${text}」這句貼圖文案對應的情緒、動作與情境來設計角色演出。`
    )
    .join('\n');

  const backgroundInstruction =
    backgroundMode === 'no_background'
      ? `- Every panel must use a purely solid bright magenta (#FF00FF) background for chroma key removal.
- The magenta background must connect cleanly to all four edges of each panel with no gradients, no texture, and no shadows in the background area.
- Keep only the main character and essential interactive props. Remove room scenery, sky, walls, floors, and environmental set dressing unless the prop is directly used by the character.
- Do NOT place the artwork inside a photo card, paper frame, inner square, sticker border, polaroid, postcard, or monitor-like window.`
      : `- Keep a contextual scene background, but it must extend naturally to the panel edges.
- Do NOT place the artwork inside an inner square, white border, beige paper frame, photo card, sticker card, polaroid, postcard, poster, or decorative panel border.
- Avoid monitor windows, framed posters, paper mats, or inset boxes that create a second rectangle inside the panel.
- Compose the scene as a full-bleed panel with clean margins for later LINE sticker cropping.`;

  return `You are creating a single LINE sticker sheet image.

Hard requirements:
- Output exactly one 2x2 grid image with 4 equal square panels.
- Keep the same main character identity from the reference image in all panels.
- Style direction: ${style}
- Each panel must clearly match one caption concept in this exact order: ${joinTexts(texts)}.
- Each panel must have a different pose, facial expression, and situation.
- Keep strong visual separation between the four panels.
- Leave a clean caption-safe area near the bottom of every panel for client-side text overlay.
- Do NOT render any visible words, letters, Latin alphabet, pinyin, Arabic numerals, UI labels, logos, watermarks, signatures, or speech bubble text.
- Do NOT draw placeholder glyphs or fake handwritten scribbles that look like text.
- Focus on expressive character acting, readable silhouettes, and uncluttered composition.
- Use Traditional Chinese cultural tone in the acting and mood, but no visible text in the image.
${backgroundInstruction}

Scene directions:
${panelPrompts}

${isFollowUp ? 'Create a fresh variation that is clearly different from previous attempts while preserving the same character and caption order.' : 'Create the first high-clarity version of this sticker sheet.'}`;
};

export const DEFAULT_STICKER_STYLE = '可愛插畫';
export const DEFAULT_STICKER_TEXTS = ['早安', '感謝你', '收到', '辛苦了'];

export const LINE_STICKER_SIZE = {
  width: 370,
  height: 320,
  safeWidth: 350,
  safeHeight: 300,
};

export const LINE_MAIN_SIZE = {
  width: 240,
  height: 240,
};

export const LINE_TAB_SIZE = {
  width: 96,
  height: 74,
};

export const BG_BATCH_LIMIT = 30;

export const BACKGROUND_MODES = [
  {
    id: 'ai_character',
    label: '僅保留本體',
    description: '保留主角，移除背景、文字與其他干擾元素。',
  },
  {
    id: 'ai_text',
    label: '本體 + 文字',
    description: '適合保留對白、標語或已完成字體設計的貼圖。',
  },
  {
    id: 'ai_props',
    label: '本體 + 道具',
    description: '保留角色與互動道具，例如杯子、桌面、商品等。',
  },
  {
    id: 'ai_all',
    label: '本體 + 文字 + 道具',
    description: '只移除場景背景，其餘前景元素盡量保留。',
  },
  {
    id: 'classic',
    label: '原版綠幕直出',
    description: '略過 AI 語意重繪，直接對綠幕圖做透明化處理。',
  },
];

export const BACKGROUND_MODE_COPY = {
  ai_character: '本體',
  ai_text: '本體_文字',
  ai_props: '本體_道具',
  ai_all: '本體_文字_道具',
  classic: '綠幕直出',
};

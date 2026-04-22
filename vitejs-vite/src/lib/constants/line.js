export const DEFAULT_STICKER_STYLE = '可愛插畫';
export const DEFAULT_STICKER_TEXTS = ['早安', '感謝你', '收到', '辛苦了'];
export const DEFAULT_STICKER_THEME = '厭世上班族';
export const DEFAULT_STICKER_BACKGROUND_MODE = 'no_background';

export const LINE_STICKER_SIZE = {
  width: 370,
  height: 320,
  safeWidth: 350,
  safeHeight: 300,
};

export const LINE_STICKER_GRID = {
  rows: 2,
  cols: 2,
};

export const LINE_STICKER_TEXT_OVERLAY = {
  reservedHeight: 82,
  sidePadding: 18,
  bandPaddingX: 18,
  bandPaddingBottom: 12,
  fontMaxSize: 44,
  fontMinSize: 24,
  strokeWidth: 10,
  fontWeight: 900,
  fontFamily:
    '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Heiti TC", sans-serif',
};

export const STICKER_BACKGROUND_OPTIONS = [
  {
    id: 'no_background',
    label: '不要背景',
    description: '只保留主體與互動道具，系統會自動去除綠幕並套用繁體中文字。',
  },
  {
    id: 'with_background',
    label: '保留背景',
    description: '保留場景背景，系統會嘗試偵測內框、紙邊或外圍留白後再裁切。',
  },
];

export const STICKER_BACKGROUND_MODE_COPY = {
  no_background: '無背景',
  with_background: '保留背景',
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

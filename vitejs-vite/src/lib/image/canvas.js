import {
  LINE_STICKER_GRID,
  LINE_STICKER_SIZE,
  LINE_STICKER_TEXT_OVERLAY,
} from '../constants/line';

export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('圖片載入失敗。'));
    image.src = src;
  });

const createCanvas = (width, height, readFrequently = false) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', {
    willReadFrequently: readFrequently,
  });

  if (!context) {
    throw new Error('目前瀏覽器環境不支援 Canvas 2D。');
  }

  return { canvas, context };
};

export const resizeAndPadImage = async (
  base64,
  targetWidth,
  targetHeight,
  keepAspect = true
) => {
  const image = await loadImage(base64);
  const { canvas, context } = createCanvas(targetWidth, targetHeight);

  if (keepAspect) {
    const scale = Math.min(targetWidth / image.width, targetHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;
    context.drawImage(image, x, y, drawWidth, drawHeight);
  } else {
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
  }

  return canvas.toDataURL('image/png');
};

const getContentBounds = (data, width, height, inset = 10) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = inset; y < height - inset; y += 1) {
    for (let x = inset; x < width - inset; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      const isBackground = a < 16 || (r > 242 && g > 242 && b > 242);

      if (!isBackground) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };
  }

  return { minX, minY, maxX, maxY };
};

const getFullBounds = (width, height) => ({
  minX: 0,
  minY: 0,
  maxX: width - 1,
  maxY: height - 1,
});

const expandBounds = (bounds, width, height, padding) => ({
  minX: Math.max(0, bounds.minX - padding),
  minY: Math.max(0, bounds.minY - padding),
  maxX: Math.min(width - 1, bounds.maxX + padding),
  maxY: Math.min(height - 1, bounds.maxY + padding),
});

const getBoundsFromMask = (mask, data, width, height, inset = 0) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = inset; y < height - inset; y += 1) {
    for (let x = inset; x < width - inset; x += 1) {
      const index = y * width + x;
      const alpha = data[index * 4 + 3];

      if (mask[index] === 0 && alpha > 16) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return null;
  }

  return { minX, minY, maxX, maxY };
};

const quantizeChannel = (value) => Math.round(value / 24) * 24;

const getDominantEdgeSwatch = (data, width, height, thickness = 6) => {
  const buckets = new Map();
  let total = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (
        x >= thickness &&
        x < width - thickness &&
        y >= thickness &&
        y < height - thickness
      ) {
        continue;
      }

      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];

      if (alpha < 220) {
        continue;
      }

      const r = quantizeChannel(data[pixelIndex]);
      const g = quantizeChannel(data[pixelIndex + 1]);
      const b = quantizeChannel(data[pixelIndex + 2]);
      const key = `${r},${g},${b}`;
      const count = buckets.get(key) || 0;
      buckets.set(key, count + 1);
      total += 1;
    }
  }

  if (total === 0) {
    return null;
  }

  let dominantKey = null;
  let dominantCount = 0;
  for (const [key, count] of buckets.entries()) {
    if (count > dominantCount) {
      dominantKey = key;
      dominantCount = count;
    }
  }

  if (!dominantKey) {
    return null;
  }

  const [r, g, b] = dominantKey.split(',').map(Number);
  return {
    r,
    g,
    b,
    ratio: dominantCount / total,
  };
};

const isLikelyPaperFrame = (swatch) => {
  if (!swatch) {
    return false;
  }

  const channelSpread = Math.max(swatch.r, swatch.g, swatch.b) - Math.min(swatch.r, swatch.g, swatch.b);
  const luma = swatch.r * 0.299 + swatch.g * 0.587 + swatch.b * 0.114;

  return channelSpread <= 26 && luma >= 156 && swatch.ratio >= 0.38;
};

const isNearSwatch = (r, g, b, swatch, tolerance = 54) =>
  Math.abs(r - swatch.r) + Math.abs(g - swatch.g) + Math.abs(b - swatch.b) <= tolerance;

const detectPanelFrameBounds = (data, width, height) => {
  const swatch = getDominantEdgeSwatch(data, width, height);

  if (!isLikelyPaperFrame(swatch)) {
    return null;
  }

  const mask = new Uint8Array(width * height);
  const queue = [];

  const pushIndex = (x, y) => {
    queue.push(y * width + x);
  };

  for (let x = 0; x < width; x += 1) {
    pushIndex(x, 0);
    pushIndex(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    pushIndex(0, y);
    pushIndex(width - 1, y);
  }

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];

    if (mask[index] === 1) {
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    const pixelIndex = index * 4;
    const alpha = data[pixelIndex + 3];
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];

    if (alpha < 18 || isNearSwatch(r, g, b, swatch)) {
      mask[index] = 1;

      if (x > 0) queue.push(index - 1);
      if (x < width - 1) queue.push(index + 1);
      if (y > 0) queue.push(index - width);
      if (y < height - 1) queue.push(index + width);
    }
  }

  const bounds = getBoundsFromMask(mask, data, width, height, 4);

  if (!bounds) {
    return null;
  }

  const margins = {
    left: bounds.minX,
    top: bounds.minY,
    right: width - bounds.maxX - 1,
    bottom: height - bounds.maxY - 1,
  };

  const substantialMargins = Object.values(margins).filter(
    (margin) => margin >= Math.min(width, height) * 0.04
  ).length;
  const averageHorizontalMargin = (margins.left + margins.right) / 2;
  const averageVerticalMargin = (margins.top + margins.bottom) / 2;
  const areaRatio =
    ((bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1)) /
    (width * height);

  if (
    substantialMargins < 2 ||
    areaRatio <= 0.38 ||
    areaRatio >= 0.94 ||
    Math.abs(margins.left - margins.right) > width * 0.08 ||
    Math.abs(margins.top - margins.bottom) > height * 0.08 ||
    averageHorizontalMargin < width * 0.03 ||
    averageHorizontalMargin > width * 0.24 ||
    averageVerticalMargin < height * 0.03 ||
    averageVerticalMargin > height * 0.24
  ) {
    return null;
  }

  return expandBounds(bounds, width, height, 4);
};

export const cropAndResizeForLineSticker = async (base64) => {
  const image = await loadImage(base64);
  const { canvas, context } = createCanvas(image.width, image.height, true);
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = getContentBounds(
    imageData.data,
    canvas.width,
    canvas.height,
    10
  );

  const croppedWidth = bounds.maxX - bounds.minX + 1;
  const croppedHeight = bounds.maxY - bounds.minY + 1;

  const scale = Math.min(
    LINE_STICKER_SIZE.safeWidth / croppedWidth,
    LINE_STICKER_SIZE.safeHeight / croppedHeight
  );
  const finalWidth = croppedWidth * scale;
  const finalHeight = croppedHeight * scale;
  const offsetX = (LINE_STICKER_SIZE.width - finalWidth) / 2;
  const offsetY = (LINE_STICKER_SIZE.height - finalHeight) / 2;

  const { canvas: outputCanvas, context: outputContext } = createCanvas(
    LINE_STICKER_SIZE.width,
    LINE_STICKER_SIZE.height
  );

  outputContext.drawImage(
    canvas,
    bounds.minX,
    bounds.minY,
    croppedWidth,
    croppedHeight,
    offsetX,
    offsetY,
    finalWidth,
    finalHeight
  );

  return outputCanvas.toDataURL('image/png');
};

export const splitGridIntoStickers = async (
  gridDataUrl,
  rows = LINE_STICKER_GRID.rows,
  cols = LINE_STICKER_GRID.cols
) => {
  const image = await loadImage(gridDataUrl);
  const pieceWidth = Math.floor(image.width / cols);
  const pieceHeight = Math.floor(image.height / rows);
  const { canvas, context } = createCanvas(pieceWidth, pieceHeight);
  const pieces = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      context.clearRect(0, 0, pieceWidth, pieceHeight);
      context.drawImage(
        image,
        x * pieceWidth,
        y * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      );
      pieces.push(canvas.toDataURL('image/png'));
    }
  }

  return pieces;
};

const buildRoundedRect = (context, x, y, width, height, radius) => {
  if (typeof context.roundRect === 'function') {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    return;
  }

  const adjustedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + adjustedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, adjustedRadius);
  context.arcTo(x + width, y + height, x, y + height, adjustedRadius);
  context.arcTo(x, y + height, x, y, adjustedRadius);
  context.arcTo(x, y, x + width, y, adjustedRadius);
  context.closePath();
};

const getStickerTextFontSize = (context, text, maxWidth) => {
  const {
    fontFamily,
    fontMaxSize,
    fontMinSize,
    fontWeight,
  } = LINE_STICKER_TEXT_OVERLAY;

  for (let fontSize = fontMaxSize; fontSize >= fontMinSize; fontSize -= 2) {
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    if (context.measureText(text).width <= maxWidth) {
      return fontSize;
    }
  }

  return fontMinSize;
};

const drawStickerCaption = (context, text) => {
  if (!text) {
    return;
  }

  const {
    bandPaddingBottom,
    bandPaddingX,
    fontFamily,
    fontWeight,
    strokeWidth,
  } = LINE_STICKER_TEXT_OVERLAY;

  const bandHeight = LINE_STICKER_TEXT_OVERLAY.reservedHeight;
  const bandWidth = LINE_STICKER_SIZE.safeWidth;
  const bandX = (LINE_STICKER_SIZE.width - bandWidth) / 2;
  const bandY =
    LINE_STICKER_SIZE.height -
    bandHeight -
    ((LINE_STICKER_SIZE.height - LINE_STICKER_SIZE.safeHeight) / 2);
  const textMaxWidth = bandWidth - bandPaddingX * 2;
  const fontSize = getStickerTextFontSize(context, text, textMaxWidth);

  buildRoundedRect(context, bandX, bandY + bandPaddingBottom, bandWidth, bandHeight - 8, 28);
  context.fillStyle = 'rgba(8, 15, 32, 0.36)';
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  context.lineWidth = 1.2;
  context.stroke();

  context.save();
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(13, 18, 30, 0.96)';
  context.lineWidth = strokeWidth;
  context.shadowColor = 'rgba(0, 0, 0, 0.26)';
  context.shadowBlur = 12;
  context.fillStyle = '#ffffff';
  const textY = bandY + bandHeight / 2 + 6;
  context.strokeText(text, LINE_STICKER_SIZE.width / 2, textY);
  context.fillText(text, LINE_STICKER_SIZE.width / 2, textY);
  context.restore();
};

export const buildLineStickerFromGridPiece = async (
  base64,
  caption = '',
  options = {}
) => {
  const { backgroundMode = 'no_background' } = options;
  const image = await loadImage(base64);
  const { canvas, context } = createCanvas(image.width, image.height, true);
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const bounds =
    backgroundMode === 'with_background'
      ? detectPanelFrameBounds(imageData.data, canvas.width, canvas.height) ||
        getFullBounds(canvas.width, canvas.height)
      : getContentBounds(imageData.data, canvas.width, canvas.height, 10);
  const croppedWidth = bounds.maxX - bounds.minX + 1;
  const croppedHeight = bounds.maxY - bounds.minY + 1;

  const safeTop = (LINE_STICKER_SIZE.height - LINE_STICKER_SIZE.safeHeight) / 2;
  const captionReserve =
    backgroundMode === 'no_background' && caption
      ? LINE_STICKER_TEXT_OVERLAY.reservedHeight
      : 0;
  const availableWidth = LINE_STICKER_SIZE.safeWidth;
  const availableHeight = LINE_STICKER_SIZE.safeHeight - captionReserve;
  const scale = Math.min(availableWidth / croppedWidth, availableHeight / croppedHeight);
  const drawWidth = croppedWidth * scale;
  const drawHeight = croppedHeight * scale;
  const offsetX = (LINE_STICKER_SIZE.width - drawWidth) / 2;
  const offsetY = safeTop + (availableHeight - drawHeight) / 2;

  const { canvas: outputCanvas, context: outputContext } = createCanvas(
    LINE_STICKER_SIZE.width,
    LINE_STICKER_SIZE.height
  );

  outputContext.drawImage(
    canvas,
    bounds.minX,
    bounds.minY,
    croppedWidth,
    croppedHeight,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight
  );

  drawStickerCaption(outputContext, caption);

  return outputCanvas.toDataURL('image/png');
};

export const combineStickerImagesIntoGrid = async (
  pieces,
  rows = LINE_STICKER_GRID.rows,
  cols = LINE_STICKER_GRID.cols
) => {
  if (!Array.isArray(pieces) || pieces.length === 0) {
    throw new Error('沒有可用的貼圖可以合成預覽網格。');
  }

  const firstImage = await loadImage(pieces[0]);
  const pieceWidth = firstImage.width;
  const pieceHeight = firstImage.height;
  const { canvas, context } = createCanvas(pieceWidth * cols, pieceHeight * rows);

  await Promise.all(
    pieces.map(async (piece, index) => {
      const image = index === 0 ? firstImage : await loadImage(piece);
      const x = (index % cols) * pieceWidth;
      const y = Math.floor(index / cols) * pieceHeight;
      context.drawImage(image, x, y, pieceWidth, pieceHeight);
    })
  );

  return canvas.toDataURL('image/png');
};

export const prepareStickerSetFromGrid = async (
  gridDataUrl,
  texts,
  backgroundMode = 'no_background'
) => {
  const rawPieces = await splitGridIntoStickers(gridDataUrl);
  const stickers = await Promise.all(
    rawPieces.map(async (piece, index) => {
      const processedPiece =
        backgroundMode === 'no_background'
          ? await processGreenScreen(piece, { backdropColor: 'magenta' })
          : piece;

      return buildLineStickerFromGridPiece(
        processedPiece,
        texts[index] || `圖${index + 1}`,
        {
          backgroundMode,
        }
      );
    })
  );
  const previewGrid = await combineStickerImagesIntoGrid(stickers);

  return { previewGrid, stickers };
};

const rgbToHsl = (r, g, b) => {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let h;
  switch (max) {
    case normalizedR:
      h = (normalizedG - normalizedB) / delta + (normalizedG < normalizedB ? 6 : 0);
      break;
    case normalizedG:
      h = (normalizedB - normalizedR) / delta + 2;
      break;
    default:
      h = (normalizedR - normalizedG) / delta + 4;
      break;
  }

  return { h: (h / 6) * 360, s, l };
};

export const processGreenScreen = async (base64Src, options = {}) => {
  const { backdropColor = 'green' } = options;
  const image = await loadImage(base64Src);
  const { canvas, context } = createCanvas(image.width, image.height, true);
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const isGreen = (r, g, b) => {
    if (Math.abs(r) + Math.abs(g - 255) + Math.abs(b) < 18) {
      return true;
    }

    const hsl = rgbToHsl(r, g, b);

    return (
      hsl.h >= 60 &&
      hsl.h <= 185 &&
      hsl.s >= 0.22 &&
      hsl.l >= 0.12 &&
      hsl.l <= 0.95 &&
      g >= r + 12 &&
      g >= b + 12
    );
  };

  const isMagenta = (r, g, b) => {
    if (Math.abs(r - 255) + Math.abs(g) + Math.abs(b - 255) < 22) {
      return true;
    }

    const hsl = rgbToHsl(r, g, b);

    return (
      (hsl.h >= 285 || hsl.h <= 345) &&
      hsl.s >= 0.24 &&
      hsl.l >= 0.12 &&
      hsl.l <= 0.95 &&
      r >= g + 20 &&
      b >= g + 20
    );
  };

  const isBackdrop = backdropColor === 'magenta' ? isMagenta : isGreen;

  const isWhiteStroke = (r, g, b) => {
    const hsl = rgbToHsl(r, g, b);
    return hsl.l > 0.85 && hsl.s < 0.15;
  };

  const mask = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x += 1) {
    queue.push(x, (height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    queue.push(y * width, y * width + (width - 1));
  }

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];

    if (mask[index] === 1) {
      continue;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    const pixelIndex = index * 4;

    if (isBackdrop(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2])) {
      mask[index] = 1;

      if (x > 0) queue.push(index - 1);
      if (x < width - 1) queue.push(index + 1);
      if (y > 0) queue.push(index - width);
      if (y < height - 1) queue.push(index + width);
    }
  }

  for (let index = 0; index < width * height; index += 1) {
    const pixelIndex = index * 4;

    if (mask[index] === 1) {
      let protect = false;
      const x = index % width;
      const y = Math.floor(index / width);

      for (let dy = -2; dy <= 2 && !protect; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const nextX = x + dx;
          const nextY = y + dy;

          if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
            continue;
          }

          const maskIndex = nextY * width + nextX;
          const nextPixelIndex = maskIndex * 4;

          if (
            mask[maskIndex] === 0 &&
            isWhiteStroke(
              data[nextPixelIndex],
              data[nextPixelIndex + 1],
              data[nextPixelIndex + 2]
            )
          ) {
            protect = true;
            break;
          }
        }
      }

      if (!protect) {
        data[pixelIndex + 3] = 0;
      }
    } else if (
      backdropColor === 'green' &&
      data[pixelIndex + 1] > data[pixelIndex] &&
      data[pixelIndex + 1] > data[pixelIndex + 2]
    ) {
      data[pixelIndex + 1] = (data[pixelIndex] + data[pixelIndex + 2]) / 2;
    } else if (
      backdropColor === 'magenta' &&
      data[pixelIndex] > data[pixelIndex + 1] &&
      data[pixelIndex + 2] > data[pixelIndex + 1]
    ) {
      const average = (data[pixelIndex] + data[pixelIndex + 2]) / 2;
      data[pixelIndex] = (average + data[pixelIndex + 1]) / 2;
      data[pixelIndex + 2] = (average + data[pixelIndex + 1]) / 2;
    }
  }

  const original = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const alphaIndex = (y * width + x) * 4 + 3;

      if (data[alphaIndex] > 0 && data[alphaIndex] < 255) {
        continue;
      }

      let alphaSum = 0;

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          alphaSum += original[((y + dy) * width + (x + dx)) * 4 + 3];
        }
      }

      data[alphaIndex] = alphaSum / 9;
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

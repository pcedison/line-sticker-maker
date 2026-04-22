import { LINE_STICKER_SIZE } from '../constants/line';

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

export const splitGridIntoStickers = async (gridDataUrl, rows = 2, cols = 2) => {
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

export const processGreenScreen = async (base64Src) => {
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

    if (isGreen(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2])) {
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
    } else if (data[pixelIndex + 1] > data[pixelIndex] && data[pixelIndex + 1] > data[pixelIndex + 2]) {
      data[pixelIndex + 1] = (data[pixelIndex] + data[pixelIndex + 2]) / 2;
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

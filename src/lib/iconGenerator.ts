import { AppConfig, IconShape } from '../types';

export const MIPMAP_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
  'playstore-512': 512,
};

/**
 * Draws an app icon onto an HTML Canvas and returns the canvas
 */
export async function renderIconToCanvas(
  iconConfig: AppConfig['icon'],
  size: number = 512,
  applyMask: boolean = false
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw Shape / Background
  ctx.save();
  if (applyMask) {
    drawShapePath(ctx, 0, 0, size, size, iconConfig.shape);
    ctx.clip();
  }

  // Background fill
  ctx.fillStyle = iconConfig.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // If custom image is uploaded
  if (iconConfig.customDataUrl) {
    try {
      const img = await loadImage(iconConfig.customDataUrl);
      const scale = iconConfig.scale || 0.8;
      const targetW = size * scale;
      const targetH = size * scale;
      const offsetX = (size - targetW) / 2;
      const offsetY = (size - targetH) / 2;
      ctx.drawImage(img, offsetX, offsetY, targetW, targetH);
    } catch (e) {
      console.warn('Failed to load custom icon image, falling back', e);
      drawFallbackGlyph(ctx, size, iconConfig.iconColor);
    }
  } else {
    // Render icon glyph or initial
    drawGlyph(ctx, size, iconConfig.presetIconName, iconConfig.iconColor, iconConfig.scale);
  }

  ctx.restore();
  return canvas;
}

function drawShapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  shape: IconShape
) {
  ctx.beginPath();
  switch (shape) {
    case 'circle': {
      const r = width / 2;
      ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
      break;
    }
    case 'squircle': {
      // Modern smooth squircle / superellipse
      const r = width * 0.22;
      ctx.roundRect(x, y, width, height, r);
      break;
    }
    case 'rounded': {
      const r = width * 0.15;
      ctx.roundRect(x, y, width, height, r);
      break;
    }
    case 'teardrop': {
      const r = width / 2;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, 0);
      break;
    }
    case 'square':
    default:
      ctx.rect(x, y, width, height);
      break;
  }
  ctx.closePath();
}

function drawFallbackGlyph(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', size / 2, size / 2);
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  size: number,
  iconName: string,
  color: string,
  scale: number = 0.75
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, size * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const center = size / 2;
  const targetSize = size * (scale || 0.75);
  const half = targetSize / 2;

  // Render stylized vector glyph based on selected icon
  switch (iconName.toLowerCase()) {
    case 'globe':
      ctx.beginPath();
      ctx.arc(center, center, half, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(center, center, half * 0.45, half, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(center - half, center);
      ctx.lineTo(center + half, center);
      ctx.stroke();
      break;

    case 'bot':
      ctx.beginPath();
      ctx.roundRect(center - half * 0.8, center - half * 0.6, targetSize * 0.8, targetSize * 0.7, half * 0.2);
      ctx.stroke();
      // Antennas
      ctx.moveTo(center, center - half * 0.6);
      ctx.lineTo(center, center - half * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center - half * 0.9, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.beginPath();
      ctx.arc(center - half * 0.35, center - half * 0.2, size * 0.04, 0, Math.PI * 2);
      ctx.arc(center + half * 0.35, center - half * 0.2, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(center, center + half * 0.1, half * 0.3, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      break;

    case 'sparkles':
      drawStar(ctx, center, center, 4, half * 0.9, half * 0.25);
      drawStar(ctx, center + half * 0.5, center - half * 0.5, 4, half * 0.4, half * 0.12);
      break;

    case 'shoppingbag':
    case 'shopping-bag':
      ctx.beginPath();
      ctx.roundRect(center - half * 0.7, center - half * 0.4, targetSize * 0.7, targetSize * 0.8, half * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center - half * 0.4, half * 0.35, Math.PI, 0);
      ctx.stroke();
      break;

    case 'music':
      ctx.beginPath();
      ctx.arc(center - half * 0.4, center + half * 0.4, half * 0.3, 0, Math.PI * 2);
      ctx.arc(center + half * 0.4, center + half * 0.2, half * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(center - half * 0.1, center + half * 0.4);
      ctx.lineTo(center - half * 0.1, center - half * 0.6);
      ctx.lineTo(center + half * 0.7, center - half * 0.8);
      ctx.lineTo(center + half * 0.7, center + half * 0.2);
      ctx.stroke();
      break;

    case 'code':
      ctx.beginPath();
      // <
      ctx.moveTo(center - half * 0.2, center - half * 0.5);
      ctx.lineTo(center - half * 0.7, center);
      ctx.lineTo(center - half * 0.2, center + half * 0.5);
      // >
      ctx.moveTo(center + half * 0.2, center - half * 0.5);
      ctx.lineTo(center + half * 0.7, center);
      ctx.lineTo(center + half * 0.2, center + half * 0.5);
      // /
      ctx.moveTo(center + half * 0.1, center - half * 0.6);
      ctx.lineTo(center - half * 0.1, center + half * 0.6);
      ctx.stroke();
      break;

    case 'filetext':
    case 'file-text':
      ctx.beginPath();
      ctx.roundRect(center - half * 0.6, center - half * 0.8, targetSize * 0.6, targetSize * 0.8, half * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(center - half * 0.3, center - half * 0.3);
      ctx.lineTo(center + half * 0.3, center - half * 0.3);
      ctx.moveTo(center - half * 0.3, center);
      ctx.lineTo(center + half * 0.3, center);
      ctx.moveTo(center - half * 0.3, center + half * 0.3);
      ctx.lineTo(center + half * 0.1, center + half * 0.3);
      ctx.stroke();
      break;

    default:
      // Modern stylized geometric "A" or initial icon
      ctx.font = `bold ${Math.round(size * 0.48)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconName.charAt(0).toUpperCase() || 'W', center, center);
      break;
  }

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function getIconBlob(
  iconConfig: AppConfig['icon'],
  size: number
): Promise<Blob> {
  const canvas = await renderIconToCanvas(iconConfig, size, false);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
}

export async function getIconDataUrl(
  iconConfig: AppConfig['icon'],
  size: number = 512
): Promise<string> {
  const canvas = await renderIconToCanvas(iconConfig, size, false);
  return canvas.toDataURL('image/png');
}

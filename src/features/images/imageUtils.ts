import { ImageAsset } from "@/stores/imageAssetStore";
import { ImageShape } from "@/types";
import { generateId } from "@/lib/geometry";

const ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

/** Maximum dimension (px) an inserted image is scaled down to. */
const MAX_DIM = 800;

export function isImageFile(file: File): boolean {
  return ACCEPTED_MIME_TYPES.has(file.type);
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function measureImage(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to measure image dimensions"));
    img.src = dataURL;
  });
}

export async function createAssetFromFile(file: File): Promise<ImageAsset> {
  const dataURL = await fileToDataURL(file);
  const { width, height } = await measureImage(dataURL);
  return {
    id: generateId(),
    mimeType: file.type,
    dataURL,
    width,
    height,
  };
}

export function createImageShape(
  asset: ImageAsset,
  centerX: number,
  centerY: number,
  zIndex: number
): ImageShape {
  let w = asset.width;
  let h = asset.height;

  if (w > MAX_DIM || h > MAX_DIM) {
    const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  return {
    id: generateId(),
    type: "image",
    imageId: asset.id,
    x: centerX - w / 2,
    y: centerY - h / 2,
    width: w,
    height: h,
    fill: "none",
    fillStyle: "none",
    stroke: "none",
    strokeWidth: 2,
    strokeStyle: "solid",
    opacity: 1,
    zIndex,
    locked: false,
    roundness: "sharp",
  };
}

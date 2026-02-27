/**
 * Canvas API ашиглан зургийг crop хийж Blob болгон буцаана.
 * react-easy-crop-ийн onCropComplete callback-аас croppedAreaPixels авна.
 */

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Image элемент үүсгэж, load болтол хүлээх */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Зургийг crop хийж JPEG Blob буцаана.
 * @param imageSrc — DataURL эсвэл зургийн URL
 * @param pixelCrop — react-easy-crop-ийн croppedAreaPixels утга
 * @param quality — JPEG чанар (0-1, default 0.9)
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  quality = 0.9,
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context авч чадсангүй');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas-аас Blob үүсгэж чадсангүй'));
      },
      'image/jpeg',
      quality,
    );
  });
}

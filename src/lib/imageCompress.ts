/**
 * 클라이언트 사이드 이미지 압축 유틸리티
 * canvas를 사용해 이미지를 리사이즈하고 JPEG로 압축
 */

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const JPEG_QUALITY = 0.7;

export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // 이미 충분히 작으면 그대로 반환
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        return;
      }

      // 비율 유지 리사이즈
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = dataUrl;
  });
}

export async function compressImages(
  dataUrls: string[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < dataUrls.length; i++) {
    results.push(await compressImage(dataUrls[i]));
    onProgress?.(i + 1, dataUrls.length);
  }
  return results;
}

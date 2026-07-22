export const USER_IMAGE_CONSTRAINTS = {
  maxBytes: 10 * 1024 * 1024,
  minWidth: 320,
  minHeight: 480,
  maxWidth: 4096,
  maxHeight: 8192,
  /** width / height — portrait full-body range */
  minAspectRatio: 0.3,
  maxAspectRatio: 0.9,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
}

export type ImageValidationErrorCode =
  | "INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | "IMAGE_LOAD_FAILED"
  | "TOO_SMALL"
  | "ASPECT_RATIO"

export type ImageValidationResult =
  | { ok: true; width: number; height: number }
  | { ok: false; code: ImageValidationErrorCode }

export function imageValidationMessage(code: ImageValidationErrorCode, isAr: boolean): string {
  const messages: Record<ImageValidationErrorCode, { ar: string; en: string }> = {
    INVALID_TYPE: {
      ar: "يُقبل فقط JPG أو PNG أو WebP",
      en: "Only JPG, PNG, or WebP images are accepted",
    },
    FILE_TOO_LARGE: {
      ar: "حجم الصورة يجب ألا يتجاوز 10 ميغابايت",
      en: "Image size must not exceed 10 MB",
    },
    IMAGE_LOAD_FAILED: {
      ar: "تعذّر قراءة الصورة — جرّب ملفاً آخر",
      en: "Could not read the image — try another file",
    },
    TOO_SMALL: {
      ar: "الصورة صغيرة جداً — استخدم صورة أوضح للجسم كاملاً",
      en: "Image is too small — use a clearer full-body photo",
    },
    ASPECT_RATIO: {
      ar: "يُفضّل صورة عمودية للجسم كاملاً (نسبة 3:4 تقريباً)",
      en: "Prefer a vertical full-body photo (around 3:4 ratio)",
    },
  }
  return isAr ? messages[code].ar : messages[code].en
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("load failed"))
    }
    img.src = url
  })
}

export async function validateUserBodyImage(file: File): Promise<ImageValidationResult> {
  const { allowedTypes, maxBytes, minWidth, minHeight, minAspectRatio, maxAspectRatio } =
    USER_IMAGE_CONSTRAINTS

  if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
    return { ok: false, code: "INVALID_TYPE" }
  }

  if (file.size > maxBytes) {
    return { ok: false, code: "FILE_TOO_LARGE" }
  }

  let dimensions: { width: number; height: number }
  try {
    dimensions = await readImageDimensions(file)
  } catch {
    return { ok: false, code: "IMAGE_LOAD_FAILED" }
  }

  const { width, height } = dimensions
  if (width < minWidth || height < minHeight) {
    return { ok: false, code: "TOO_SMALL" }
  }

  const aspectRatio = width / height
  if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
    return { ok: false, code: "ASPECT_RATIO" }
  }

  return { ok: true, width, height }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== "string") {
        reject(new Error("read failed"))
        return
      }
      const base64 = result.split(",")[1]
      if (!base64) {
        reject(new Error("invalid data url"))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error("read failed"))
    reader.readAsDataURL(file)
  })
}

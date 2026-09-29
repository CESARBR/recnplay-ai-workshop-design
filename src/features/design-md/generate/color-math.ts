// Conversões sRGB ↔ OKLab/OKLCH (Björn Ottosson, https://bottosson.github.io/posts/oklab/)
// e luminância WCAG. Tudo determinístico: a mesma entrada sempre gera a mesma saída.

export type Rgb = { r: number; g: number; b: number } // 0–255
export type Oklch = { l: number; c: number; h: number } // l 0–1, c ≥ 0, h em graus

const toLinear = (channel: number) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}
const fromLinear = (value: number) =>
  255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const hue = (Math.atan2(B, A) * 180) / Math.PI
  return { l: L, c: Math.hypot(A, B), h: hue < 0 ? hue + 360 : hue }
}

/** OKLCH → sRGB linear sem recorte (pode sair do intervalo 0–1 fora do gamut). */
function oklchToLinearRgb({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180
  const A = c * Math.cos(rad)
  const B = c * Math.sin(rad)
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const inGamut = (channels: number[]) => channels.every((value) => value >= -1e-4 && value <= 1 + 1e-4)

/** OKLCH → sRGB, reduzindo o croma (busca binária) até caber no gamut sRGB. */
export function oklchToRgb(color: Oklch): Rgb {
  const target = { ...color, l: Math.min(1, Math.max(0, color.l)), c: Math.max(0, color.c) }
  let linear = oklchToLinearRgb(target)
  if (!inGamut(linear)) {
    let low = 0
    let high = target.c
    for (let step = 0; step < 24; step++) {
      const mid = (low + high) / 2
      if (inGamut(oklchToLinearRgb({ ...target, c: mid }))) low = mid
      else high = mid
    }
    linear = oklchToLinearRgb({ ...target, c: low })
  }
  const [r, g, b] = linear.map((value) => Math.round(Math.min(255, Math.max(0, fromLinear(Math.min(1, Math.max(0, value)))))))
  return { r, g, b }
}

export const rgbToHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase()

/** Luminância relativa WCAG 2.x. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

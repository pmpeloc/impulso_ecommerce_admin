/**
 * Generates the Prodcast favicon and PWA icons using only Node.js built-ins.
 * The mark mirrors public/logo-mark.svg and is supersampled for smooth edges.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBytes = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([length, typeBytes, data, crc])
}

function isInsideRoundedRect(x, y, left, top, right, bottom, radius) {
  const nearestX = Math.max(left + radius, Math.min(x, right - radius))
  const nearestY = Math.max(top + radius, Math.min(y, bottom - radius))
  const dx = x - nearestX
  const dy = y - nearestY
  return dx * dx + dy * dy <= radius * radius
}

function isInsideCircle(x, y, centerX, centerY, radius) {
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}

function sampleLogo(x, y) {
  const background = [99, 102, 241, 255]
  const white = [255, 255, 255, 255]
  const violet = [168, 85, 247, 255]

  if (!isInsideRoundedRect(x, y, 0, 0, 96, 96, 22)) return [0, 0, 0, 0]

  let color = background
  const verticalStem = x >= 33 && x <= 44 && y >= 27 && y <= 69
  const outerBowl = isInsideRoundedRect(x, y, 33, 27, 68, 59, 16)
  const innerBowl = isInsideRoundedRect(x, y, 44, 37, 56.5, 48, 5.5)
  if (verticalStem || (outerBowl && !innerBowl)) color = white

  if (isInsideCircle(x, y, 68, 34, 8)) color = background
  if (isInsideCircle(x, y, 68, 34, 6.5)) color = violet

  return color
}

function createLogoPng(size) {
  const supersample = size <= 48 ? 8 : 4
  const rows = []

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    for (let x = 0; x < size; x++) {
      const totals = [0, 0, 0, 0]
      for (let sy = 0; sy < supersample; sy++) {
        for (let sx = 0; sx < supersample; sx++) {
          const logoX = ((x + (sx + 0.5) / supersample) / size) * 96
          const logoY = ((y + (sy + 0.5) / supersample) / size) * 96
          const sample = sampleLogo(logoX, logoY)
          for (let channel = 0; channel < 4; channel++) totals[channel] += sample[channel]
        }
      }
      const samples = supersample * supersample
      for (let channel = 0; channel < 4; channel++) {
        row[1 + x * 4 + channel] = Math.round(totals[channel] / samples)
      }
    }
    rows.push(row)
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function createIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  const entries = []
  let offset = 6 + images.length * 16
  for (const { size, png } of images) {
    const entry = Buffer.alloc(16)
    entry[0] = size
    entry[1] = size
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += png.length
  }

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)])
}

const iconsDir = join(rootDir, 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

for (const size of [180, 192, 512]) {
  const png = createLogoPng(size)
  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`
  const outputDir = size === 180 ? join(rootDir, 'public') : iconsDir
  writeFileSync(join(outputDir, filename), png)
  console.log(`Generated ${filename}`)
}

const faviconImages = [16, 32, 48].map((size) => ({ size, png: createLogoPng(size) }))
writeFileSync(join(rootDir, 'src', 'app', 'favicon.ico'), createIco(faviconImages))
console.log('Generated favicon.ico')

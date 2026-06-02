/**
 * Generates minimal solid-color PNG icons for the Prodcast PWA.
 * Uses only Node.js built-ins (zlib + fs/Buffer). No extra deps.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── CRC32 (required by PNG spec) ─────────────────────────────────────────────
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// ─── PNG chunk builder ─────────────────────────────────────────────────────────
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBytes = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

// ─── Solid-color PNG generator ────────────────────────────────────────────────
function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, 8-bit RGB (color type 2)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB

  // Scanlines: filter byte (0 = None) + RGB per pixel
  const row = Buffer.alloc(1 + size * 3)
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const scanlines = Buffer.concat(Array.from({ length: size }, () => row))

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(scanlines)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Generate icons ────────────────────────────────────────────────────────────
const iconsDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(iconsDir, { recursive: true })

// Prodcast brand color: black (#000000)
for (const size of [192, 512]) {
  const png = createPNG(size, 0, 0, 0)
  const outPath = join(iconsDir, `icon-${size}x${size}.png`)
  writeFileSync(outPath, png)
  console.log(`✓ icon-${size}x${size}.png  (${(png.length / 1024).toFixed(1)} KB)`)
}

console.log('Icons generated in public/icons/')

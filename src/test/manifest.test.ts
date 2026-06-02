import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PUBLIC_DIR = join(process.cwd(), 'public')

describe('PWA Manifest', () => {
  const manifest = JSON.parse(readFileSync(join(PUBLIC_DIR, 'manifest.json'), 'utf-8'))

  it('tiene el nombre correcto de la app', () => {
    expect(manifest.name).toBe('Prodcast')
    expect(manifest.short_name).toBe('Prodcast')
  })

  it('tiene display standalone (obligatorio para PWA instalable)', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('start_url apunta al dashboard', () => {
    expect(manifest.start_url).toBe('/dashboard')
  })

  it('tiene orientation portrait', () => {
    expect(manifest.orientation).toBe('portrait')
  })

  it('tiene theme_color y background_color definidos', () => {
    expect(manifest.theme_color).toBeDefined()
    expect(manifest.background_color).toBeDefined()
  })

  it('tiene al menos dos iconos declarados', () => {
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  it('declara ícono de 192x192', () => {
    const icon192 = manifest.icons.find((i: { sizes: string }) => i.sizes === '192x192')
    expect(icon192).toBeDefined()
    expect(icon192.src).toContain('192')
  })

  it('declara ícono de 512x512', () => {
    const icon512 = manifest.icons.find((i: { sizes: string }) => i.sizes === '512x512')
    expect(icon512).toBeDefined()
    expect(icon512.src).toContain('512')
  })
})

describe('PWA Icons (archivos)', () => {
  it('existe el archivo icon-192x192.png', () => {
    expect(existsSync(join(PUBLIC_DIR, 'icons', 'icon-192x192.png'))).toBe(true)
  })

  it('existe el archivo icon-512x512.png', () => {
    expect(existsSync(join(PUBLIC_DIR, 'icons', 'icon-512x512.png'))).toBe(true)
  })

  it('icon-192x192.png es un PNG válido (firma correcta)', () => {
    const file = readFileSync(join(PUBLIC_DIR, 'icons', 'icon-192x192.png'))
    // PNG signature: 137 80 78 71 13 10 26 10
    expect(file[0]).toBe(137)
    expect(file[1]).toBe(80)  // 'P'
    expect(file[2]).toBe(78)  // 'N'
    expect(file[3]).toBe(71)  // 'G'
  })

  it('icon-512x512.png es un PNG válido (firma correcta)', () => {
    const file = readFileSync(join(PUBLIC_DIR, 'icons', 'icon-512x512.png'))
    expect(file[0]).toBe(137)
    expect(file[1]).toBe(80)
    expect(file[2]).toBe(78)
    expect(file[3]).toBe(71)
  })
})

describe('layout.tsx — meta tags PWA', () => {
  const layoutPath = join(process.cwd(), 'src', 'app', 'layout.tsx')
  const layout = readFileSync(layoutPath, 'utf-8')

  it('referencia el manifest.json', () => {
    expect(layout).toContain('manifest')
  })

  it('tiene meta tag para Apple Web App', () => {
    expect(layout).toContain('appleWebApp')
  })

  it('tiene viewport configurado', () => {
    expect(layout).toContain('viewport')
  })
})

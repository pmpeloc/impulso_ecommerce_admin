import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'> & {
    fill?: boolean
    priority?: boolean
    unoptimized?: boolean
  }) => {
    const imageProps = { ...props }
    delete imageProps.fill
    delete imageProps.priority
    delete imageProps.unoptimized
    return React.createElement('img', imageProps)
  },
}))

// Env vars no se cargan automáticamente en Vitest (lo hace Next.js en runtime)
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_NAME ??= 'Prodcast'

import '@testing-library/jest-dom'

// Env vars no se cargan automáticamente en Vitest (lo hace Next.js en runtime)
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_NAME ??= 'Prodcast'

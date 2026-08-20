import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'src/utils/phraseClicheDetector.test.ts',
      'src/utils/__tests__/formDetector.test.ts',
    ],
  },
})

import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikNxVite } from 'qwik-nx/plugins'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/libs/ui',
  plugins: [qwikNxVite(), qwikVite(), tsconfigPaths({ root: '../../' })],

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reportsDirectory: '../../coverage/libs/ui',
    },
  },
})

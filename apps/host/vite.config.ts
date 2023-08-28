// noinspection ES6PreferShortImport
// noinspection ES6PreferShortImport
import { qwikCity } from '@builder.io/qwik-city/vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikNxVite } from 'qwik-nx/plugins'
import { defineConfig, ServerOptions } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// eslint-disable-next-line @nx/enforce-module-boundaries
import { remotes } from '../../libs/shared/src/util/remotes'
import { generateCssTokens } from './styles/util/cssGenerator'

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production'

  generateCssTokens(isDev)

  return {
    cacheDir: '../../node_modules/.vite/apps/host',
    plugins: [
      qwikNxVite(),
      qwikCity(),
      qwikVite({
        client: {
          outDir: '../../dist/apps/host/client',
        },
        ssr: {
          outDir: '../../dist/apps/host/server',
        },
      }),
      tsconfigPaths({ root: '../../' }),
    ],
    server: {
      fs: {
        // Allow serving files from the project root
        allow: ['../../'],
      },
      proxy: getProxy(),
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
    test: {
      globals: true,
      cache: {
        dir: '../../node_modules/.vitest',
      },
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  }
})

const getProxy = () => {
  const proxy: ServerOptions['proxy'] = {}

  Object.entries(remotes).forEach(([name, { origin }]) => {
    proxy[`^/${name}/.*`] = {
      target: origin,
      changeOrigin: true,
      rewrite: (path) => {
        return path.replace(`/${name}`, '')
      },
    }
  })

  return proxy
}

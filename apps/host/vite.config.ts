import { qwikCity } from '@builder.io/qwik-city/vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikNxVite } from 'qwik-nx/plugins'
import { ServerOptions, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { remotes } from 'shared/remotes'

import { fixRemoteHTMLInDevMode } from './common'
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
      proxy: getProxy(isDev),
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

const getProxy = (isDev: boolean) => {
  const proxy: ServerOptions['proxy'] = {}

  Object.entries(remotes).forEach(([name, { host }]) => {
    proxy[`^/${name}/.*`] = {
      target: host,
      changeOrigin: true,
      selfHandleResponse: isDev,
      rewrite: (path) => {
        return path.replace(`/${name}`, '')
      },
      configure: (proxy) => {
        proxy.on('proxyRes', (proxyRes, req, res) => {
          if (isDev) {
            const chunks: Buffer[] = []
            proxyRes.on('data', (chunk) => chunks.push(chunk))
            proxyRes.on('end', function () {
              const decoder = new TextDecoder()
              const rawHtml = decoder.decode(Buffer.concat(chunks))
              if (req.url && req.url.slice(-3) === '.js') {
                res.setHeader('Content-Type', 'application/javascript')
                res.write(rawHtml)
              } else {
                res.setHeader('Content-Type', 'text/html')
                const fixedHtmlObj = fixRemoteHTMLInDevMode(rawHtml, '', isDev)
                res.write(fixedHtmlObj.html)
              }
              res.end()
            })
          }
        })
      },
    }
  })

  return proxy
}

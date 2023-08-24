import {
  component$,
  SSRStream,
  SSRStreamBlock,
  StreamWriter,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'

import { usePersonalization } from '~shared'
import { objectToCookiesString } from '~shared'
import { type RemoteData, remotes } from '~shared'

import { fixRemoteHTMLInDevMode } from '../../util/localDevMode'

export interface Props {
  remote?: RemoteData
  path?: string
  removeLoader?: boolean
  fetchOnVisible?: boolean
  offset?: number
}

export default component$(
  ({
    remote = remotes.static,
    path,
    fetchOnVisible = false,
    removeLoader = true,
    offset = 100,
  }: Props) => {
    const store = usePersonalization()
    const location = useLocation()

    const pathname = path || location.url.pathname

    const [scrollElementRef, insertionElementRef] = useFetchOnScroll(
      fetchOnVisible,
      new URL(remote.name + pathname, location.url.origin)
    )

    const decoder = new TextDecoder()
    const getSSRStreamFunction = () => async (stream: StreamWriter) => {
      const remoteUrl = new URL(pathname, remote.host)
      if (removeLoader) {
        remoteUrl.searchParams.append('loader', 'false')
      }
      const reader = (
        await fetch(remoteUrl, {
          headers: {
            accept: 'text/html',
            cookie: objectToCookiesString(store),
          },
        })
      ).body?.getReader()

      if (!reader) return

      let fragmentChunk = await reader.read()
      while (!fragmentChunk.done) {
        const rawHtml = decoder.decode(fragmentChunk.value)
        const fixedHtmlObj = fixRemoteHTMLInDevMode(
          rawHtml,
          '',
          import.meta.env.DEV
        )
        stream.write(fixedHtmlObj.html)
        fragmentChunk = await reader.read()
      }
    }

    // TODO doesn't work with SPA
    return (
      <>
        {fetchOnVisible && !store.isBot ? (
          <div
            class="pointer-events-none relative"
            style={{ top: `-${offset}px` }}
            ref={scrollElementRef}
          >
            {/* TODO spinner */}
            <div
              class="pointer-events-auto relative"
              style={{ top: `${offset}px` }}
              ref={insertionElementRef}
            >
              loading...
            </div>
          </div>
        ) : (
          <SSRStreamBlock>
            <SSRStream>{getSSRStreamFunction()}</SSRStream>
          </SSRStreamBlock>
        )}
      </>
    )
  }
)

export function useFetchOnScroll(enabled: boolean, remoteUrl: URL) {
  const scrollElementRef = useSignal<HTMLDivElement>()
  const insertionElementRef = useSignal<HTMLDivElement>()

  useVisibleTask$(async () => {
    if (scrollElementRef.value && insertionElementRef.value && enabled) {
      const response = await fetch(remoteUrl, {
        headers: {
          accept: 'text/html',
        },
      })
      if (response.ok) {
        const rawHtml = await response.text()
        const { html } = fixRemoteHTMLInDevMode(
          rawHtml,
          '',
          import.meta.env.DEV
        )
        insertionElementRef.value.innerHTML = html
      }
    }
  })

  return [scrollElementRef, insertionElementRef]
}

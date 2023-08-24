import {
  component$,
  SSRStream,
  SSRStreamBlock,
  StreamWriter,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'

import { usePersonalization } from 'shared/context/personalization'
import { objectToCookiesString } from 'shared/cookies'
import { type RemoteData } from 'shared/remotes'

import { fixRemoteHTMLInDevMode } from '../../../common'

export interface Props {
  remote: RemoteData
  path?: string
  removeLoader?: boolean
  fetchOnVisible?: boolean
  offset?: number
}

export default component$(
  ({
    remote,
    path,
    fetchOnVisible = false,
    removeLoader = true,
    offset = 100,
  }: Props) => {
    const store = usePersonalization()
    const location = useLocation()

    const pathname = path || location.url.pathname

    const scrollElementRef = useFetchOnScroll(
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
          // TODO spinner
          <div
            style={{ position: 'relative', top: `-${offset}px` }}
            ref={scrollElementRef}
          >
            loading...
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

  useVisibleTask$(async () => {
    if (scrollElementRef.value && enabled) {
      scrollElementRef.value.style.top = '0'
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
        scrollElementRef.value.innerHTML = html
      }
    }
  })

  return scrollElementRef
}

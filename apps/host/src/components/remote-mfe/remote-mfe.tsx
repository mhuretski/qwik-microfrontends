import {
  component$,
  SSRStream,
  SSRStreamBlock,
  StreamWriter,
} from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'

import { fixRemoteHTMLInDevMode } from '../../../shared'
import { type RemoteData } from '../../../../../shared/remotes'
import { usePersonalization } from 'shared/context/personalization'
import { objectToCookiesString } from '../../../../../shared/cookies'

export interface Props {
  remote: RemoteData
  path?: string
  removeLoader?: boolean
}

export default component$(({ remote, path, removeLoader = true }: Props) => {
  const store = usePersonalization()
  const location = useLocation()

  const decoder = new TextDecoder()
  const getSSRStreamFunction = () => async (stream: StreamWriter) => {
    const pathname = path || location.url.pathname
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

    if (!reader) return null

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
    <SSRStreamBlock>
      <SSRStream>{getSSRStreamFunction()}</SSRStream>
    </SSRStreamBlock>
  )
})

import {
  component$,
  SSRStream,
  SSRStreamBlock,
  StreamWriter,
  useSignal,
  useVisibleTask$,
} from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'

import {
  fixRemoteHTMLInDevMode,
  objectToCookiesString,
  PersonalizationState,
  RemoteData,
  remotes,
  usePersonalization,
} from '~shared'

export type JSONSerializable = {
  value:
    | string
    | number
    | boolean
    | null
    | JSONSerializable[]
    | { [key: string]: JSONSerializable }
}

type MfeSlot = {
  path: string
  data: JSONSerializable['value']
  type?: 'dynamic' | 'static'
}

type DesiredSlots = Record<string, MfeSlot>

type ProcessedSlot = {
  regex: RegExp
  html: string
}

type Props = {
  remote?: RemoteData
  path?: string
  fetchOnVisible?: boolean
  offset?: number
  slots?: DesiredSlots
}

export const Remote = component$(
  ({
    remote = remotes.static,
    path,
    fetchOnVisible = false,
    offset = 100,
    slots,
  }: Props) => {
    const store = usePersonalization()
    const location = useLocation()

    const pathname = path || location.url.pathname

    const [scrollElementRef, insertionElementRef] = useFetchOnScroll(
      fetchOnVisible,
      remote.name + pathname,
      location.url.origin
    )

    const getSSRStreamFunction = () => async (stream: StreamWriter) => {
      async function processSlots(
        slots?: DesiredSlots
      ): Promise<ProcessedSlot[] | undefined> {
        if (!slots) return

        const processedSlots: ProcessedSlot[] = []

        try {
          for (const slotName in slots) {
            const { path, type, data } = slots[slotName]

            // TODO passing data to dynamic component, should refactor with URL params
            if (data) {
              store.stringifiedData = JSON.stringify({ value: data })
            }

            const url = new URL(path, remotes[type ?? 'dynamic'].origin)
            url.searchParams.append('loader', 'false')

            // TODO chunking
            const response = await fetch(url, {
              headers: {
                accept: 'text/html',
                cookie: objectToCookiesString(
                  store as Omit<PersonalizationState, 'parsedData'>
                ),
              },
            })
            if (response.ok) {
              const rawHtml = await response.text()
              const { html } = fixRemoteHTMLInDevMode(
                rawHtml,
                '',
                import.meta.env.DEV
              )

              processedSlots.push({
                regex: new RegExp(
                  `<!--qv[^>]*q:key=${slotName}[^>]*--><!--/qv-->`
                ),
                html,
              })
            }
          }
        } catch (e) {
          console.error(e)
        }

        return processedSlots
      }

      const processedSlotsPromise = processSlots(slots)

      const remoteUrl = new URL(pathname, remote.origin)
      remoteUrl.searchParams.append('loader', 'false')

      const reader = (
        await fetch(remoteUrl, {
          headers: {
            accept: 'text/html',
            cookie: objectToCookiesString(
              store as Omit<PersonalizationState, 'parsedData'>
            ),
          },
        })
      ).body?.getReader()

      if (!reader) return

      let fragmentChunk = await reader.read()
      let count = 0
      let processedSlots: ProcessedSlot[] | undefined

      const decoder = new TextDecoder()
      while (!fragmentChunk.done) {
        // FIXME 2 chunks to process at once in case slot is between the chunks
        let rawHtml = decoder.decode(fragmentChunk.value)

        if (count === 0 && slots != null) {
          processedSlots = await processedSlotsPromise
        }

        processedSlots?.forEach((processedSlot) => {
          const result = processedSlot.regex.exec(rawHtml)
          if (result) {
            rawHtml =
              rawHtml.slice(0, result.index) +
              processedSlot.html +
              rawHtml.slice(result.index + result[0].length)
          }
        })

        const fixedHtmlObj = fixRemoteHTMLInDevMode(
          rawHtml,
          '',
          import.meta.env.DEV
        )

        stream.write(fixedHtmlObj.html)
        fragmentChunk = await reader.read()

        count++
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

export function useFetchOnScroll(
  enabled: boolean,
  path: string,
  origin: string
) {
  const scrollElementRef = useSignal<HTMLDivElement>()
  const insertionElementRef = useSignal<HTMLDivElement>()

  useVisibleTask$(async () => {
    if (scrollElementRef.value && insertionElementRef.value && enabled) {
      const response = await fetch(new URL(path, origin), {
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

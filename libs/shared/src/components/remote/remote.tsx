import {
  component$,
  JSXNode,
  Slot,
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

export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | JSONSerializable[]
  | { [key: string]: JSONSerializable }

/*
 * Could be added property `children: MfeSlot<T>` to have
 * host -> static -> dynamic -> static -> dynamic ...
 * but it will create waterfalls.
 * Scenario host -> static -> dynamic seems reasonable enough,
 * requests in this scenario are fired in parallel, unless dynamic has
 * sequential requests
 */
type MfeSlot<T extends JSONSerializable = JSONSerializable> = {
  path: string
  data?: T
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
  fallback?: JSXNode
}

type LazyLoadProps = {
  path: string
  base: string
  origin: string
  store: PersonalizationState
  slots?: DesiredSlots
  offset?: number
  fallback?: JSXNode
}

const LazyLoad = component$(
  ({ path, base, origin, store, slots, offset, fallback }: LazyLoadProps) => {
    const { scrollElementRef, insertionElementRef, spinnerREf } =
      useFetchOnScroll(path, base, origin, store, slots)

    const elemOffset = offset + 'px'

    return (
      <div
        class="pointer-events-none relative"
        style={{ top: '-' + elemOffset }}
        ref={scrollElementRef}
      >
        <div
          class="pointer-events-auto relative"
          style={{ top: elemOffset }}
          ref={insertionElementRef}
        />
        {/*
         * Hack to allow pass custom loading components,
         * can't put inside insertionElement.
         * If component re-renders, spinner overrides existing content
         */}
        <div class="relative" style={{ top: elemOffset }}>
          <div ref={spinnerREf}>{fallback ? <Slot /> : 'Loading...'}</div>
        </div>
      </div>
    )
  }
)

export const Remote = component$(
  ({
    remote = remotes.static,
    path,
    fetchOnVisible = false,
    offset = 0,
    slots,
    fallback,
  }: Props) => {
    const store = usePersonalization()
    const location = useLocation()

    const pathname = path || location.url.pathname

    return (
      <div>
        {fetchOnVisible && !store.isBot ? (
          <LazyLoad
            path={remote.name + pathname}
            base={'/' + remote.name}
            origin={location.url.origin}
            store={store}
            slots={slots}
            offset={offset}
            fallback={fallback}
          >
            {fallback}
          </LazyLoad>
        ) : (
          <SSRStreamBlock>
            <SSRStream>
              {getSSRStreamFunction(remote, pathname, store, slots)}
            </SSRStream>
          </SSRStreamBlock>
        )}
      </div>
    )
  }
)

function useFetchOnScroll(
  path: string,
  base: string,
  origin: string,
  store: PersonalizationState,
  slots?: DesiredSlots
) {
  const scrollElementRef = useSignal<HTMLDivElement>()
  const insertionElementRef = useSignal<HTMLDivElement>()
  const spinnerREf = useSignal<HTMLDivElement>()

  useVisibleTask$(async () => {
    if (scrollElementRef.value && insertionElementRef.value) {
      const processedSlotsPromise = processSlots(store, slots, true)

      const url = new URL(path, origin)
      url.searchParams.append('loader', 'false')

      const response = await fetch(url, {
        headers: {
          accept: 'text/html',
        },
      })
      if (response.ok) {
        const rawHtml = await response.text()

        let processedSlots: ProcessedSlot[] | undefined
        if (slots != null) {
          processedSlots = await processedSlotsPromise
        }

        insertionElementRef.value.innerHTML = prepareHtmlWithSlots(
          rawHtml,
          base,
          processedSlots
        )
        if (spinnerREf.value) {
          spinnerREf.value.style.display = 'none'
        }

        /*
         * When scripts are inserted with `innerHTML` after page is loaded, they are not executed,
         * re-executing them manually
         */
        const containers = insertionElementRef.value.querySelectorAll(
          '[q\\:container="paused"]'
        )
        containers.forEach((container) => {
          Array.from(container.children).forEach((child) => {
            if (child.tagName === 'SCRIPT') {
              const newScript = document.createElement('script')
              for (const attribute of child.attributes) {
                newScript.setAttribute(attribute.name, attribute.value)
              }
              newScript.textContent = child.textContent
              container.appendChild(newScript)
            }
          })
        })
      }
    }
  })

  return { scrollElementRef, insertionElementRef, spinnerREf }
}

function getSSRStreamFunction(
  remote: RemoteData,
  pathname: string,
  store: PersonalizationState,
  slots?: DesiredSlots
) {
  return async (stream: StreamWriter) => {
    const processedSlotsPromise = processSlots(store, slots)

    const remoteUrl = new URL(pathname, remote.origin)
    remoteUrl.searchParams.append('loader', 'false')

    const reader = (
      await fetch(remoteUrl, {
        headers: {
          accept: 'text/html',
          cookie: objectToCookiesString(store),
        },
      })
    ).body?.getReader()

    if (!reader) return

    const decoder = new TextDecoder()
    let fragmentChunk = await reader.read()

    const base = '/' + remote?.name

    const isSlotRequired = slots != null
    if (!isSlotRequired) {
      while (!fragmentChunk.done) {
        const rawHtml = decoder.decode(fragmentChunk.value)

        const html = fixRemoteHTMLInDevMode(rawHtml, base, import.meta.env.DEV)

        stream.write(html)
        fragmentChunk = await reader.read()
      }

      return
    }

    const generalSlotRegex = /<!--qv[^>]*q:key=[^>]*--><!--\/qv-->/gm
    let processedSlots: ProcessedSlot[] | undefined

    /*
     * Slot might be between chunks
     */
    const chunksWaitingToBeSent = []

    while (!fragmentChunk.done) {
      const rawHtml = decoder.decode(fragmentChunk.value)

      let html
      const isSlotPresent = generalSlotRegex!.exec(rawHtml)
      if (isSlotPresent) {
        if (!processedSlots) {
          processedSlots = await processedSlotsPromise
        }

        html = prepareHtmlWithSlots(rawHtml, base, processedSlots)
      } else {
        html = fixRemoteHTMLInDevMode(rawHtml, base, import.meta.env.DEV)
      }

      chunksWaitingToBeSent.push(html)
      if (chunksWaitingToBeSent.length > 1) {
        const [first, second] = chunksWaitingToBeSent
        const firstEnd = first.substring(first.length - 100, first.length)
        const secondStart = second.substring(0, 100)

        const isSlotPresent = generalSlotRegex!.exec(firstEnd + secondStart)
        if (isSlotPresent) {
          /*
           * Concat first and second chunk, wait for third in case second chunk had partial slots at start and end
           */
          html = prepareHtmlWithSlots(first + second, base, processedSlots)
          chunksWaitingToBeSent[chunksWaitingToBeSent.length - 1] = html
          chunksWaitingToBeSent.pop()
        } else {
          stream.write(chunksWaitingToBeSent.shift()!)
        }
      }

      fragmentChunk = await reader.read()
    }

    if (chunksWaitingToBeSent.length) {
      chunksWaitingToBeSent.forEach((chunk) => {
        stream.write(chunk)
      })
    }
  }
}

async function processSlots(
  store: PersonalizationState,
  slots?: DesiredSlots,
  fetchOnVisible?: boolean
): Promise<ProcessedSlot[] | undefined> {
  if (!slots) return

  const processedSlots: ProcessedSlot[] = []

  try {
    for (const slotName in slots) {
      const { path, type, data } = slots[slotName]

      const appType = type ?? 'dynamic'

      const remote = remotes[appType]
      const requestedPath = `${remote.name}${
        path.startsWith('/') ? '' : '/'
      }${path}${path.endsWith('/') ? '' : '/'}`
      const url = fetchOnVisible
        ? new URL(requestedPath, window.location.origin)
        : new URL(path, remote.origin)
      url.searchParams.append('loader', 'false')

      if (data) {
        url.searchParams.append('v', JSON.stringify({ v: data }))
      }

      const response = await fetch(url, {
        headers: {
          accept: 'text/html',
          cookie: objectToCookiesString(store),
        },
      })
      if (response.ok) {
        const rawHtml = await response.text()
        const html = fixRemoteHTMLInDevMode(
          rawHtml,
          '/' + appType,
          import.meta.env.DEV
        )

        processedSlots.push({
          regex: new RegExp(`<!--qv[^>]*q:key=${slotName}[^>]*--><!--/qv-->`),
          html,
        })
      }
    }
  } catch (e) {
    console.error(e)
  }

  return processedSlots
}

function prepareHtmlWithSlots(
  sourceHtml: string,
  base: string,
  processedSlots?: ProcessedSlot[]
) {
  let fixedHtml = fixRemoteHTMLInDevMode(sourceHtml, '', import.meta.env.DEV)

  processedSlots?.forEach((processedSlot) => {
    const result = processedSlot.regex.exec(fixedHtml)
    if (result) {
      fixedHtml =
        fixedHtml.slice(0, result.index) +
        processedSlot.html +
        fixedHtml.slice(result.index + result[0].length)
    }
  })

  return fixedHtml
}

export function slot<T extends JSONSerializable>(data: MfeSlot<T>) {
  return data
}

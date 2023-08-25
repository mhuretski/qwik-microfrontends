import { component$, Slot } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'
import type { RequestHandler } from '@builder.io/qwik-city'

import {
  getPersonalizedData,
  useCheckoutProvider,
  usePersonalizationProvider,
} from '~shared'

export const onGet: RequestHandler = async (req) => {
  const { next, sharedMap, cookie } = req

  const viewed = cookie.get('viewed')
  sharedMap.set('viewed', viewed?.value ? Number(viewed.value) : 0)

  await next()
}

export const usePersonalized = routeLoader$(({ sharedMap }) =>
  getPersonalizedData(sharedMap)
)

export default component$(() => {
  // TODO figure out how to cache all possible personalized html pages having same routes but different cookies
  const personalizedType = usePersonalized()

  usePersonalizationProvider(personalizedType.value)
  useCheckoutProvider()

  return <Slot />
})

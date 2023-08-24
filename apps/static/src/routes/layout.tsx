import { component$, Slot } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'
import type { RequestHandler } from '@builder.io/qwik-city'

import {
  getPersonalizedData,
  usePersonalizationProvider,
} from 'shared/context/personalization'

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
  const personalizedType = usePersonalized()

  usePersonalizationProvider(personalizedType.value)

  return <Slot />
})

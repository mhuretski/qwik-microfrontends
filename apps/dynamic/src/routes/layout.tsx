import { component$, Slot } from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'
import { routeLoader$ } from '@builder.io/qwik-city'

import {
  getPersonalizedData,
  useCheckoutProvider,
  usePersonalizationProvider,
  useCommunicationProvider,
} from '~shared'

export const onGet: RequestHandler = async (req) => {
  const { next, sharedMap, cookie } = req

  const viewed = cookie.get('viewed')
  sharedMap.set('viewed', viewed?.value ? Number(viewed.value) : 0)

  const cart = cookie.get('cartAmount')
  if (cart?.value != null) {
    sharedMap.set('cartAmount', Number(cart.value))
  } else {
    sharedMap.set('cartAmount', 0)
  }

  await next()
}

export const usePersonalized = routeLoader$(({ sharedMap }) =>
  getPersonalizedData(sharedMap)
)

export default component$(() => {
  const personalizedType = usePersonalized()

  useCommunicationProvider()
  usePersonalizationProvider(personalizedType.value)
  useCheckoutProvider()

  return <Slot />
})

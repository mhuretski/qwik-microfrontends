import { component$, Slot } from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'
import { DocumentHead, routeLoader$ } from '@builder.io/qwik-city'
import { Footer } from '@qwik-microfrontends/ui'
import {
  getPersonalizedData,
  usePersonalizationProvider,
} from 'shared/context/personalization'
import { Header } from '../components/header/header'

export const onGet: RequestHandler = async (req) => {
  const { next, sharedMap, cookie } = req

  const viewed = cookie.get('viewed')
  if (viewed?.value && viewed.value === '1') {
    sharedMap.set('viewed', 1)
    cookie.set('viewed', '0')
  } else {
    sharedMap.set('viewed', 0)
    cookie.set('viewed', '1')
  }

  const cart = cookie.get('cart')
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

  usePersonalizationProvider(personalizedType.value)

  return (
    <>
      <Header />
      <main class="min-h-screen mt-18 pt-10 bg-slate-900">
        <Slot />
      </main>
      <Footer />
    </>
  )
})

export const head: DocumentHead = ({ resolveValue }) => {
  const personalized = resolveValue(usePersonalized)

  return {
    title: personalized ? 'Hello' : 'Qwik Microfrontends',
    meta: [
      {
        name: 'description',
        content: 'Qwik Microfrontends description',
      },
    ],
  }
}

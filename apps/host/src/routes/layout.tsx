import { component$, Slot } from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'
import { DocumentHead, routeLoader$ } from '@builder.io/qwik-city'
import { faker } from '@faker-js/faker'
import isbot from 'isbot'

import {
  getPersonalizedData,
  HEADER_FIRSTNAME_SLOT,
  HEADER_LASTNAME_SLOT,
  Remote,
  usePersonalizationProvider,
} from '~shared'

export const onGet: RequestHandler = async (requestEvent) => {
  const { next, sharedMap, cookie, request } = requestEvent

  sharedMap.set('isBot', isbot(request.headers.get('User-Agent')))

  // TODO remove, for demonstration purposes only
  const viewed = cookie.get('viewed')
  if (viewed?.value && viewed.value === '1') {
    sharedMap.set('viewed', 1)
    cookie.set('viewed', '0', {
      path: '/',
    })
  } else {
    sharedMap.set('viewed', 0)
    cookie.set('viewed', '1', {
      path: '/',
    })
  }

  const cart = cookie.get('cart')
  if (cart?.value != null) {
    sharedMap.set('cartAmount', Number(cart.value))
  } else {
    sharedMap.set('cartAmount', 0)
  }

  await next()
}

export const usePersonalized = routeLoader$(({ sharedMap }) => {
  return getPersonalizedData(sharedMap)
})

export const useUserData = routeLoader$(async () => {
  /*
   * Fake delay while getting Authorization token, deserializing and getting user from db
   */
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
        }),
      200
    )
  }) as Promise<{ firstname: string; lastname: string }>
})

export default component$(() => {
  const personalizedType = usePersonalized()
  const user = useUserData()

  usePersonalizationProvider(personalizedType.value)

  return (
    <>
      <Remote
        path="components/header"
        slots={{
          [HEADER_FIRSTNAME_SLOT]: {
            path: 'components/username',
            data: user.value.firstname,
          },
          [HEADER_LASTNAME_SLOT]: {
            path: 'components/username',
            data: user.value.lastname,
          },
        }}
      />
      <main class="mt-18 min-h-screen pt-10">
        <Slot />
      </main>
      <Remote path="components/footer" />
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

import { $, component$, useOnDocument, useSignal } from '@builder.io/qwik'

import { usePersonalization } from '~shared'
import { CART_QUANTITIES_CHANGED_EVENT } from '~shared'
import { setCookie } from '~shared'

export const CartCounter = component$(() => {
  const store = usePersonalization()

  const cartQtySignal = useSignal(store.cartAmount)

  useOnDocument(
    CART_QUANTITIES_CHANGED_EVENT,
    $((event) => {
      cartQtySignal.value += (event as CustomEvent).detail.qty

      setCookie('cart', cartQtySignal.value.toString(), {
        path: '/',
      })
    })
  )

  return (
    <a
      href="/checkout/summary/"
      class="mb-2 mr-2 flex w-[170px] items-center rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="margin: auto"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span class="px-2 text-lg">Cart ({cartQtySignal.value})</span>
    </a>
  )
})
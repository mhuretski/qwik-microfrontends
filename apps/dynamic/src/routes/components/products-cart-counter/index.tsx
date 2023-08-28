import { $, component$, useOnDocument, useSignal } from '@builder.io/qwik'

import {
  Button,
  CART_QUANTITIES_CHANGED_EVENT,
  type ProductsCartCounterSlotData,
  useSlotData,
} from '~shared'

export default component$(() => {
  const cartAmount = useSlotData<ProductsCartCounterSlotData>()

  const cartQtySignal = useSignal(cartAmount ?? 0)

  useOnDocument(
    CART_QUANTITIES_CHANGED_EVENT,
    $((event) => {
      cartQtySignal.value += (event as CustomEvent).detail.qty
    })
  )

  const alertCount = useSignal(0)
  const testScripts = $(() => {
    alertCount.value = alertCount.value + 1
  })

  return (
    <div class="m-2 flex items-center justify-center text-center text-2xl">
      <div class="m-2">{`I have ${cartQtySignal.value} amount of items in cart`}</div>
      <Button
        class="m-0"
        text={`Click ${alertCount.value}`}
        onClick$={testScripts}
      />
    </div>
  )
})

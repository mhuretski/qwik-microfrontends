import { component$ } from '@builder.io/qwik'
import { Form, routeAction$, z, zod$ } from '@builder.io/qwik-city'

import {
  Button,
  PRODUCTS_GREETING_SLOT,
  ProductsCartCounterSlotData,
  Remote,
  slot,
  usePersonalization,
} from '~shared'

export const useAction = routeAction$(
  () => {
    return { status: 'success' }
  },
  zod$({
    firstName: z.string(),
  })
)

export default component$(() => {
  const store = usePersonalization()

  const action = useAction()

  return (
    <div>
      <div class="mt-12">
        <Remote path="builder/kek" />
        {/*TODO Form action triggers hydration of the whole page including layout for some reason*/}
        <Form action={action} class="m-4 flex items-center">
          <input
            class="border-standard inline-flex appearance-none rounded-item bg-transparent px-4 py-2 text-base text-body-text"
            type="text"
            name="firstName"
          />
          <Button
            type="submit"
            class="mx-4 h-[52px] items-center"
            text="Use Action Test"
          />
          <p class="mx-4">{action.value?.status}</p>
        </Form>
      </div>
      <Remote
        fetchOnVisible
        slots={{
          [PRODUCTS_GREETING_SLOT]: slot<ProductsCartCounterSlotData>({
            data: store.cartAmount,
            path: 'components/products-cart-counter',
          }),
        }}
      />
    </div>
  )
})

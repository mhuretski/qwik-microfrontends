import { component$, Slot } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'

import {
  Product,
  products,
  PRODUCTS_GREETING_SLOT,
  usePersonalization,
} from '~shared'

export const useProductsLoader = routeLoader$(async () => {
  // const response = await fetch('https://fakestoreapi.com/products');
  // return (await response.json()) as ProductType[];
  return products
})

export default component$(() => {
  const productsSignal = useProductsLoader()

  const store = usePersonalization()

  return (
    <div>
      <Slot name={PRODUCTS_GREETING_SLOT} />
      <div
        class={`${
          store.viewed ? 'bg-background' : 'bg-primary'
        } flex flex-wrap`}
        style="justify-content: space-between"
      >
        {productsSignal.value.map((p) => (
          <Product product={p} key={p.id} />
        ))}
      </div>
    </div>
  )
})

import { component$ } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'

import { Product } from '~shared'
import { usePersonalization } from '~shared'
import { products } from '~shared'

export const useProductsLoader = routeLoader$(async () => {
  // const response = await fetch('https://fakestoreapi.com/products');
  // return (await response.json()) as ProductType[];
  return products
})

export default component$(() => {
  const productsSignal = useProductsLoader()

  const store = usePersonalization()

  return (
    <div
      class={`${store.viewed ? 'bg-background' : 'bg-primary'} flex flex-wrap`}
      style="justify-content: space-between"
    >
      {productsSignal.value.map((p) => (
        <Product product={p} key={p.id} />
      ))}
    </div>
  )
})

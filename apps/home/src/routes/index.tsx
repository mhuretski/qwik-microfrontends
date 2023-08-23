import { component$ } from '@builder.io/qwik'
import { routeLoader$ } from '@builder.io/qwik-city'
import { Product } from '@qwik-microfrontends/ui'
import { products } from 'shared/constants'
import { usePersonalization } from 'shared/context/personalization'

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
      class={`${store.viewed ? 'bg-blue-800' : ''} flex flex-wrap`}
      style="justify-content: space-between"
    >
      {productsSignal.value.map((p) => (
        <Product product={p} key={p.id} />
      ))}
    </div>
  )
})

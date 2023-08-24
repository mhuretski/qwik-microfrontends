import { createContextId, useContextProvider, useStore } from '@builder.io/qwik'

interface CheckoutStore {
  items: string[]
}

export const CheckoutContext = createContextId<CheckoutStore>('Todos')

export const useCheckoutProvider = () => {
  useContextProvider(
    CheckoutContext,
    useStore<CheckoutStore>({
      items: ['Qwik', 'Microfrontends'],
    })
  )
}

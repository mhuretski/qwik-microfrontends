import {
  createContextId,
  useContextProvider,
  useStore,
  useContext,
} from '@builder.io/qwik'

type PersonalizationState = {
  viewed: 1 | 0
  cartAmount: number
}

export const PersonalizationContext =
  createContextId<PersonalizationState>('personalization')

export const usePersonalization = () => {
  return useContext(PersonalizationContext)
}

export const usePersonalizationProvider = (data?: PersonalizationState) => {
  const store = useStore<PersonalizationState>(
    data ?? {
      viewed: 0,
      cartAmount: 0,
    }
  )
  useContextProvider(PersonalizationContext, store)
}

export const getPersonalizedData = (sharedMap: Map<string, any>) => {
  return {
    viewed: sharedMap.get('viewed') ?? 0,
    cartAmount: sharedMap.get('cartAmount') ?? 0,
  }
}

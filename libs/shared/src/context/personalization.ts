import {
  createContextId,
  useContextProvider,
  useStore,
  useContext,
} from '@builder.io/qwik'

import { JSONSerializable } from '~shared'

export type PersonalizationState = {
  viewed: 1 | 0
  cartAmount: number
  isBot: boolean

  // TODO move this 2 to separate context for communication
  stringifiedData?: string
  parsedData?: JSONSerializable
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
      isBot: false,
    }
  )
  useContextProvider(PersonalizationContext, store)
}

export const getPersonalizedData = (
  sharedMap: Map<string, PersonalizationState[keyof PersonalizationState]>
): PersonalizationState => {
  const viewed =
    (sharedMap.get('viewed') as PersonalizationState['viewed'] | undefined) ?? 0
  const cartAmount =
    (sharedMap.get('cartAmount') as
      | PersonalizationState['cartAmount']
      | undefined) ?? 0
  const isBot =
    (sharedMap.get('isBot') as PersonalizationState['isBot']) ?? false
  const parsedData = sharedMap.get(
    'parsedData'
  ) as PersonalizationState['parsedData']

  return {
    viewed,
    cartAmount,
    isBot,
    parsedData,
  }
}

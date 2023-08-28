import {
  createContextId,
  useContext,
  useContextProvider,
} from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'

import { JSONSerializable } from '~shared'

export type CommunicationState = {
  v: JSONSerializable
}

export const CommunicationContext =
  createContextId<CommunicationState>('Communication')

export const useCommunicationProvider = () => {
  const data = useLocation().url.searchParams.get('v')

  useContextProvider(CommunicationContext, {
    v: data ? JSON.parse(data).v : undefined,
  })
}

export const useSlotData = <T extends JSONSerializable>() => {
  return useContext(CommunicationContext).v as T | undefined
}

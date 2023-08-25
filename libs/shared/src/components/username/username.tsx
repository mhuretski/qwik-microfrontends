import { component$ } from '@builder.io/qwik'

// import { Button } from '~shared'

type Props = {
  value?: string
  onClick$?: () => void
}

export const Username = component$<Props>(({ value }) => {
  // return <Button>{value}</Button>
  return <span class="m-2">{value}</span>
})

import { $, component$ } from '@builder.io/qwik'

import { Button } from '~shared'

type Props = {
  value?: string
  onClick$?: () => void
}

export const Username = component$<Props>(({ value }) => {
  const testScripts = $(() => alert(value))

  return <Button onClick$={testScripts} class="m-2" text={value} />
})

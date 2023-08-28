import { $, component$ } from '@builder.io/qwik'

import { Button, type HeaderSlotData, useSlotData } from '~shared'

export default component$(() => {
  const username = useSlotData<HeaderSlotData>()

  const testScripts = $(() => alert(username))

  return (
    <div>
      <Button onClick$={testScripts} class="m-2" text={username} />
    </div>
  )
})

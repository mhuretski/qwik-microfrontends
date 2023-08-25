import { $, component$ } from '@builder.io/qwik'

import { usePersonalization } from '~shared'

type Props = {
  value?: string
  onClick$?: () => void
}

export default component$<Props>(() => {
  const store = usePersonalization()

  const username = store.parsedData?.value as string | undefined

  const testScripts = $(() => alert(username))

  return (
    <button onClick$={testScripts} class="m-2">
      {username}
    </button>
  )
})

import { component$ } from '@builder.io/qwik'
import { Form, routeAction$, z, zod$ } from '@builder.io/qwik-city'
import { Button } from '@qwik-microfrontends/ui'

import { remotes } from 'shared/remotes'

import RemoteMfe from '../components/remote-mfe/remote-mfe'

export const useAction = routeAction$(
  () => {
    return { status: 'success' }
  },
  zod$({
    firstName: z.string(),
  })
)

export default component$(() => {
  const action = useAction()

  return (
    <>
      <div class="mt-12">
        <RemoteMfe remote={remotes.builder} />
        <Form action={action} class="flex items-center">
          <p class="pr-4 text-white">{action.value?.status}</p>
          <input type="text" name="firstName" />
          <Button
            type="submit"
            class="mx-4 h-[52px] items-center"
            text="Use Action Test"
          />
        </Form>
      </div>
      <RemoteMfe remote={remotes.static} fetchOnVisible />
    </>
  )
})

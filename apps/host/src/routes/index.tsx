import { component$ } from '@builder.io/qwik'
import { Form, routeAction$, z, zod$ } from '@builder.io/qwik-city'

import { Button, Remote } from '~shared'

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
        <Remote path="builder/kek" />
        {/*TODO Form action triggers hydration of the whole page including layout for some reason*/}
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
      <Remote fetchOnVisible />
    </>
  )
})

import { component$ } from '@builder.io/qwik'

import { Remote } from '~shared'

export default component$(() => {
  return (
    <>
      <Remote />
      <Remote path="/" />
    </>
  )
})

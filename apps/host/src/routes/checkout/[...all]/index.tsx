import { component$ } from '@builder.io/qwik'

import Remote from '../../../components/remote/remote'

export default component$(() => {
  return (
    <>
      <Remote />
      <Remote path="/" />
    </>
  )
})

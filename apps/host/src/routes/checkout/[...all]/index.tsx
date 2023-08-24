import { component$ } from '@builder.io/qwik'

import { remotes } from 'shared/remotes'

import RemoteMfe from '../../../components/remote-mfe/remote-mfe'

export default component$(() => {
  return (
    <>
      <div class="mt-12 flex" style="color: white">
        checkout!
      </div>
      <RemoteMfe remote={remotes.checkout} />
      <RemoteMfe remote={remotes.static} path="/" />
    </>
  )
})

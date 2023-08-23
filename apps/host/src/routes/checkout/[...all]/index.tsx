import { component$ } from '@builder.io/qwik'
import RemoteMfe from '../../../components/remote-mfe/remote-mfe'
import { remotes } from '../../../../../../shared/remotes'

export default component$(() => {
  return (
    <>
      <div class="flex mt-12" style="color: white">
        checkout!
      </div>
      <RemoteMfe remote={remotes.checkout} />
      <RemoteMfe remote={remotes.static} path="/" />
    </>
  )
})

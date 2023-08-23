import { component$, useStyles$ } from '@builder.io/qwik'
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city'

import globalStyles from './global.scss?inline'

export default component$(() => {
  return (
    <QwikCityProvider>
      {import.meta.env.DEV && <Styles />}
      <RouterOutlet />
    </QwikCityProvider>
  )
})

const Styles = component$(() => {
  useStyles$(globalStyles)
  return null
})

import { component$, Resource, useResource$ } from '@builder.io/qwik'
import { useLocation } from '@builder.io/qwik-city'
import {
  getBuilderSearchParams,
  Content,
  fetchOneEntry,
} from '@builder.io/sdk-qwik'

export default component$(() => {
  const location = useLocation()

  const builderContentRsrc = useResource$(() => {
    return fetchOneEntry({
      model: 'page',
      apiKey: import.meta.env.VITE_BUILDER_PUBLIC_API_KEY || '',
      // TODO stubbed hero
      options: { heroId: 'qwik' } || getBuilderSearchParams(location.params),
      userAttributes: {
        // TODO stubbed hero
        urlPath: '/hero/qwik/' || location.url.pathname || '/',
      },
    })
  })

  return (
    <div class="my-4 mx-auto">
      <Resource
        value={builderContentRsrc}
        onPending={() => <div>Loading...</div>}
        onResolved={(content) => {
          return (
            <Content
              model="page"
              content={content}
              apiKey={import.meta.env.VITE_BUILDER_PUBLIC_API_KEY || ''}
            />
          )
        }}
      />
    </div>
  )
})

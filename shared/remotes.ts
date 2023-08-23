export type RemoteData = {
  host: string
  name: string
}

type Pages = 'static' | 'checkout' | 'builder'

type Remotes = {
  [key in Pages]: RemoteData
}

export const remotes: Remotes = {
  static: { host: 'http://localhost:5174/', name: 'static' },
  checkout: { host: 'http://localhost:5175/', name: 'checkout' },
  builder: { host: 'http://localhost:5176/', name: 'builder' },
}

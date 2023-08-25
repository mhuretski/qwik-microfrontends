export type RemoteData = {
  origin: string
  name: string
}

type Pages = 'static' | 'dynamic'

type Remotes = {
  [key in Pages]: RemoteData
}

export const remotes: Remotes = {
  static: { origin: 'http://localhost:5174/', name: 'static' },
  dynamic: { origin: 'http://localhost:5175/', name: 'dynamic' },
}

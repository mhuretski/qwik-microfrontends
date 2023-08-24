export type RemoteData = {
  host: string
  name: string
}

type Pages = 'static'

type Remotes = {
  [key in Pages]: RemoteData
}

export const remotes: Remotes = {
  static: { host: 'http://localhost:5174/', name: 'static' },
}

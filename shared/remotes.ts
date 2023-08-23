export type RemoteData = {
  host: string
}

type Pages = 'home' | 'checkout' | 'builder'

type Remotes = {
  [key in Pages]: RemoteData
}

export const remotes: Remotes = {
  home: { host: 'http://localhost:5174/' },
  checkout: { host: 'http://localhost:5175/' },
  builder: { host: 'http://localhost:5176/' },
}

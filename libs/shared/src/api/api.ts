export async function api<T>(path: string, init?: RequestInit) {
  const isServer = typeof window === 'undefined'
  const url = new URL(
    path,
    isServer
      ? `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`
      : window.location.origin
  )
  return (await fetch(url, init)).json() as Promise<T>
}

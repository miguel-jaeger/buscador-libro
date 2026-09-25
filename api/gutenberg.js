import { handleRequest } from '../gutenberg-proxy.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const query = url.searchParams.get('search')

  if (!query) {
    res.status(400)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Falta el parámetro search' }))
    return
  }

  try {
    const payload = await handleRequest(query)
    res.status(200)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.end(JSON.stringify(payload))
  } catch (err) {
    res.status(502)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message }))
  }
}
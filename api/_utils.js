export async function readJson(req) {
  return await new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      try { resolve(JSON.parse(raw || '{}')) } catch { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

export function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const body = JSON.stringify(data, (_, v) => typeof v === 'bigint' ? Number(v) : v)
  res.end(body)
}

export function ensureAdmin(req) {
  const token = req.headers['x-admin-token']
  const ok = token && token === process.env.ADMIN_PASSWORD
  return ok
}

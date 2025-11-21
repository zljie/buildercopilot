import { sendJson, readJson } from '../_utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' })
  const body = await readJson(req)
  const ok = body.password && process.env.ADMIN_PASSWORD && body.password === process.env.ADMIN_PASSWORD
  if (!ok) return sendJson(res, 401, { error: '认证失败' })
  return sendJson(res, 200, { token: body.password })
}

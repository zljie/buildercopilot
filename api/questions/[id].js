import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const status = b.status === 'RESOLVED' ? 'RESOLVED' : 'OPEN'
    await db.execute({ sql: 'UPDATE owner_questions SET status = ? WHERE id = ?', args: [status, id] })
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

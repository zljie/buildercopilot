import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM scheme_templates WHERE id = ?', args: [id] })
    return sendJson(res, 200, r.rows[0] || null)
  }
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const updates = []
    const args = []
    for (const k of ['name','description']) { if (k in b) { updates.push(`${k} = ?`); args.push(b[k]) } }
    if (!updates.length) return sendJson(res, 400, { error: '无更新字段' })
    args.push(id)
    await db.execute({ sql: `UPDATE scheme_templates SET ${updates.join(', ')} WHERE id = ?`, args })
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

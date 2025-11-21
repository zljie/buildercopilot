import { init, db } from '../../../db.js'
import { sendJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'GET') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const r = await db.execute({ sql: 'SELECT id, title, content, contact, status, created_at FROM owner_questions WHERE project_id = ? ORDER BY id DESC', args: [projectId] })
    return sendJson(res, 200, r.rows)
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT id, display_name, role, join_date FROM project_members WHERE project_id = ? ORDER BY id DESC', args: [projectId] })
    return sendJson(res, 200, r.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const r = await db.execute({
      sql: 'INSERT INTO project_members (project_id, user_id, display_name, role, join_date) VALUES (?, ?, ?, ?, ?)',
      args: [projectId, b.user_id || null, b.display_name || null, b.role || null, b.join_date || null]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

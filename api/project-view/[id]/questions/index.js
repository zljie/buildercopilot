import { init, db } from '../../../db.js'
import { sendJson, readJson } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'POST') {
    const code = req.query.code
    const proj = await db.execute({ sql: 'SELECT access_code FROM projects WHERE id = ?', args: [projectId] })
    const p = proj.rows[0]
    if (!p) return sendJson(res, 404, { error: '项目不存在' })
    if (p.access_code && code !== p.access_code) return sendJson(res, 401, { error: '访问码错误' })
    const b = await readJson(req)
    const title = (b.title || '').trim()
    const content = (b.content || '').trim()
    const contact = (b.contact || '').trim()
    const created_at = new Date().toISOString()
    const r = await db.execute({ sql: 'INSERT INTO owner_questions (project_id, title, content, contact, status, created_at) VALUES (?, ?, ?, ?, ?, ?)', args: [projectId, title, content, contact, 'OPEN', created_at] })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT id, title, content, contact, status, created_at FROM owner_questions WHERE project_id = ? ORDER BY id DESC', args: [projectId] })
    return sendJson(res, 200, r.rows)
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

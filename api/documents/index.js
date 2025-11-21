import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  if (req.method === 'GET') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const r = await db.execute('SELECT * FROM documents ORDER BY id DESC')
    return sendJson(res, 200, r.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const body = await readJson(req)
    const title = body.title?.trim()
    if (!title) return sendJson(res, 400, { error: '标题必填' })
    const content = body.content || ''
    const pub = body.public ? 1 : 0
    const project_id = body.project_id || null
    const r = await db.execute({
      sql: 'INSERT INTO documents (title, content, public, project_id) VALUES (?, ?, ?, ?)',
      args: [title, content, pub, project_id]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

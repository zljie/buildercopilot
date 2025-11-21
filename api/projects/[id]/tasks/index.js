import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const body = await readJson(req)
    const title = body.title?.trim()
    const type = body.type === 'todo' ? 'todo' : 'purchase'
    if (!title) return sendJson(res, 400, { error: '任务标题必填' })
    const stage_id = body.stage_id || null
    const description = body.description || ''
    const due_date = body.due_date || null
    const r = await db.execute({
      sql: 'INSERT INTO tasks (project_id, stage_id, title, description, type, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [projectId, stage_id, title, description, type, due_date]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

import { init, db } from '../db.js'
import { sendJson } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  const code = req.query.code
  const proj = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] })
  const p = proj.rows[0]
  if (!p) return sendJson(res, 404, { error: '项目不存在' })
  if (p.access_code && code !== p.access_code) return sendJson(res, 401, { error: '访问码错误' })
  const stages = await db.execute({ sql: 'SELECT * FROM stages WHERE project_id = ? ORDER BY "order" ASC', args: [id] })
  const tasks = await db.execute({ sql: 'SELECT * FROM tasks WHERE project_id = ? ORDER BY id DESC', args: [id] })
  return sendJson(res, 200, { project: p, stages: stages.rows, tasks: tasks.rows })
}

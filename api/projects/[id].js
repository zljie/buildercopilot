import { init, db } from '../db.js'
import { sendJson } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  if (req.method === 'GET') {
    const proj = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] })
    if (!proj.rows[0]) return sendJson(res, 404, { error: '项目不存在' })
    const stages = await db.execute({ sql: 'SELECT * FROM stages WHERE project_id = ? ORDER BY "order" ASC', args: [id] })
    const tasks = await db.execute({ sql: 'SELECT * FROM tasks WHERE project_id = ? ORDER BY id DESC', args: [id] })
    return sendJson(res, 200, { project: proj.rows[0], stages: stages.rows, tasks: tasks.rows })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM payment_schedules WHERE project_id = ? ORDER BY id DESC', args: [projectId] })
    return sendJson(res, 200, r.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const r = await db.execute({
      sql: 'INSERT INTO payment_schedules (project_id, contract_id, phase, percentage, scheduled_amount, due_condition, due_date, status, actual_paid_amount, paid_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [projectId, b.contract_id || null, b.phase || null, b.percentage || null, b.scheduled_amount || null, b.due_condition || null, b.due_date || null, b.status || null, b.actual_paid_amount || null, b.paid_date || null]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

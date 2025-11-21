import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  if (req.method === 'GET') {
    const proj = await db.execute({ sql: 'SELECT * FROM projects WHERE id = ?', args: [id] })
    if (!proj.rows[0]) return sendJson(res, 404, { error: '项目不存在' })
    const stages = await db.execute({ sql: 'SELECT * FROM stages WHERE project_id = ? ORDER BY "order" ASC', args: [id] })
    const tasks = await db.execute({ sql: 'SELECT * FROM tasks WHERE project_id = ? ORDER BY id DESC', args: [id] })
    const property = await db.execute({ sql: 'SELECT * FROM property_details WHERE project_id = ? LIMIT 1', args: [id] })
    const contracts = await db.execute({ sql: 'SELECT * FROM contracts WHERE project_id = ? ORDER BY id DESC', args: [id] })
    const payments = await db.execute({ sql: 'SELECT * FROM payment_schedules WHERE project_id = ? ORDER BY id DESC', args: [id] })
    return sendJson(res, 200, { project: proj.rows[0], stages: stages.rows, tasks: tasks.rows, property: property.rows[0] || null, contracts: contracts.rows, payment_schedules: payments.rows })
  }
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const body = await readJson(req)
    const fields = ['name','description','owner_name','owner_phone','status','total_budget','actual_total_cost','planned_start_date','planned_end_date','actual_start_date','actual_end_date']
    const updates = []
    const args = []
    for (const f of fields) { if (f in body) { updates.push(`${f} = ?`); args.push(body[f]) } }
    if (!updates.length) return sendJson(res, 400, { error: '无更新字段' })
    args.push(id)
    await db.execute({ sql: `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, args })
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

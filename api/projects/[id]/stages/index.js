import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const body = await readJson(req)
    const name = body.name?.trim()
    if (!name) return sendJson(res, 400, { error: '阶段名称必填' })
    const order = Number(body.order || 1)
    const notes = body.notes || ''
    const payment_amount = Number(body.payment_amount || 0)
    const planned_start_date = body.planned_start_date || null
    const planned_duration_days = body.planned_duration_days || null
    const planned_end_date = (planned_start_date && planned_duration_days) ? (() => { const d = new Date(planned_start_date); d.setDate(d.getDate() + Number(planned_duration_days)); const yyyy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0'); return `${yyyy}-${mm}-${dd}` })() : null
    const assignee_member_id = body.assignee_member_id || null
    const major_tasks = body.major_tasks || null
    const r = await db.execute({
      sql: 'INSERT INTO stages (project_id, name, "order", notes, payment_amount, planned_start_date, planned_duration_days, planned_end_date, assignee_member_id, major_tasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [projectId, name, order, notes, payment_amount, planned_start_date, planned_duration_days, planned_end_date, assignee_member_id, major_tasks]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

function calcEndDate(start, durationDays) {
  if (!start || !durationDays) return null
  const d = new Date(start)
  d.setDate(d.getDate() + Number(durationDays))
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default async function handler(req, res) {
  await init()
  const id = req.query.id
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const fields = ['name','order','notes','payment_amount','planned_start_date','planned_duration_days','planned_end_date','assignee_member_id','major_tasks','status']
    const updates = []
    const args = []
    for (const f of fields) {
      if (f in b) {
        let val = b[f]
        updates.push(`${f.replace('order','"order"')} = ?`)
        args.push(val)
      }
    }
    // ensure planned_end_date recalculated if start/duration provided
    if (!('planned_end_date' in b) && ('planned_start_date' in b || 'planned_duration_days' in b)) {
      updates.push('planned_end_date = ?')
      args.push(calcEndDate(b.planned_start_date, b.planned_duration_days))
    }
    if (!updates.length) return sendJson(res, 400, { error: '无更新字段' })
    args.push(id)
    await db.execute({ sql: `UPDATE stages SET ${updates.join(', ')} WHERE id = ?`, args })
    const prj = await db.execute({ sql: 'SELECT project_id FROM stages WHERE id = ?', args: [id] })
    const pid = prj.rows[0]?.project_id
    if (pid) {
      const all = await db.execute({ sql: 'SELECT planned_start_date, planned_end_date FROM stages WHERE project_id = ?', args: [pid] })
      const ok = all.rows.length > 0 && all.rows.every(s => !!s.planned_start_date && !!s.planned_end_date)
      await db.execute({ sql: `UPDATE projects SET status = ? WHERE id = ?`, args: [ok ? 'EXECUTION' : 'SCHEME_SETUP', pid] })
    }
    return sendJson(res, 200, { ok: true })
  }
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM stages WHERE id = ?', args: [id] })
    if (!r.rows[0]) return sendJson(res, 404, { error: '阶段不存在' })
    return sendJson(res, 200, r.rows[0])
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

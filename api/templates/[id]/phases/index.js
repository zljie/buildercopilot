import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const templateId = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM scheme_template_phases WHERE template_id = ? ORDER BY sequence ASC', args: [templateId] })
    return sendJson(res, 200, r.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const name = b.name?.trim()
    if (!name) return sendJson(res, 400, { error: '阶段名称必填' })
    const r = await db.execute({
      sql: 'INSERT INTO scheme_template_phases (template_id, name, sequence, percentage, default_duration_days, default_major_tasks) VALUES (?, ?, ?, ?, ?, ?)',
      args: [templateId, name, b.sequence || null, b.percentage || null, b.default_duration_days || null, b.default_major_tasks || null]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const pid = b.id
    if (!pid) return sendJson(res, 400, { error: '缺少阶段ID' })
    const updates = []
    const args = []
    for (const k of ['name','sequence','percentage','default_duration_days','default_major_tasks']) { if (k in b) { updates.push(`${k} = ?`); args.push(b[k]) } }
    if (!updates.length) return sendJson(res, 400, { error: '无更新字段' })
    args.push(pid)
    await db.execute({ sql: `UPDATE scheme_template_phases SET ${updates.join(', ')} WHERE id = ?`, args })
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

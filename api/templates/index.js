import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  if (req.method === 'GET') {
    const t = await db.execute('SELECT * FROM scheme_templates ORDER BY id DESC')
    if (!t.rows.length) {
      const base = [
        { name: '楼层民宅', description: '标准楼层住宅装修方案' },
        { name: '别墅民宅', description: '标准别墅装修方案' }
      ]
      for (const tpl of base) {
        const ins = await db.execute({ sql: 'INSERT INTO scheme_templates (name, description) VALUES (?, ?)', args: [tpl.name, tpl.description] })
        const tid = ins.lastInsertRowid
        const phases = [
          { name: '项目预付款定价（实地考察与结构核对）', sequence: 1, percentage: 10, default_duration_days: 2, default_major_tasks: '现场测量与确认' },
          { name: '施工-拆砌墙', sequence: 2, percentage: 5, default_duration_days: 5, default_major_tasks: '拆墙与新砌墙' },
          { name: '施工-水电', sequence: 3, percentage: 20, default_duration_days: 10, default_major_tasks: '水电改造与布线' },
          { name: '施工-泥工', sequence: 4, percentage: 15, default_duration_days: 12, default_major_tasks: '贴砖与找平' },
          { name: '施工-木工', sequence: 5, percentage: 15, default_duration_days: 12, default_major_tasks: '造型与柜体' },
          { name: '施工-腻子工', sequence: 6, percentage: 10, default_duration_days: 7, default_major_tasks: '批刮腻子与打磨' },
          { name: '施工-乳胶漆油工', sequence: 7, percentage: 15, default_duration_days: 6, default_major_tasks: '涂装与修色' },
          { name: '收尾美容清场', sequence: 8, percentage: 10, default_duration_days: 3, default_major_tasks: '完工清洁与验收' }
        ]
        for (const ph of phases) {
          await db.execute({
            sql: 'INSERT INTO scheme_template_phases (template_id, name, sequence, percentage, default_duration_days, default_major_tasks) VALUES (?, ?, ?, ?, ?, ?)',
            args: [tid, ph.name, ph.sequence, ph.percentage, ph.default_duration_days, ph.default_major_tasks]
          })
        }
      }
      const seeded = await db.execute('SELECT * FROM scheme_templates ORDER BY id DESC')
      return sendJson(res, 200, seeded.rows)
    }
    return sendJson(res, 200, t.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const name = b.name?.trim()
    if (!name) return sendJson(res, 400, { error: '模板名称必填' })
    const r = await db.execute({ sql: 'INSERT INTO scheme_templates (name, description) VALUES (?, ?)', args: [name, b.description || null] })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  if (req.method === 'PATCH') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const id = req.query.id
    const b = await readJson(req)
    const updates = []
    const args = []
    for (const k of ['name','description']) { if (k in b) { updates.push(`${k} = ?`); args.push(b[k]) } }
    if (!updates.length) return sendJson(res, 400, { error: '无更新字段' })
    args.push(id)
    await db.execute({ sql: `UPDATE scheme_templates SET ${updates.join(', ')} WHERE id = ?`, args })
    return sendJson(res, 200, { ok: true })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

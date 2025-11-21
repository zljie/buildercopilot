import { init, db } from '../../../../api/db.js'
import { sendJson, readJson, ensureAdmin } from '../../../../api/_utils.js'
import templatesHandler from '../../../../api/contracts/templates.js'
import { db as _db } from '../../../../api/db.js'

async function getTemplateByKey(key) {
  const tmp = await new Promise((resolve) => {
    const fakeReq = { method: 'GET' }
    const fakeRes = { end: (body) => resolve(JSON.parse(body)), setHeader() {}, statusCode: 200 }
    templatesHandler(fakeReq, fakeRes)
  })
  return tmp.find(t => t.key === key)
}

export default async function handler(req, res) {
  await init()
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' })
  if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
  const projectId = req.query.id
  const body = await readJson(req)
  const templateKey = body.template_key
  const templateId = body.template_id
  const contract_amount = Number(body.contract_amount || 0)
  let t = null
  if (templateId) {
    const tRow = await _db.execute({ sql: 'SELECT * FROM scheme_templates WHERE id = ?', args: [templateId] })
    const phases = await _db.execute({ sql: 'SELECT * FROM scheme_template_phases WHERE template_id = ? ORDER BY sequence ASC', args: [templateId] })
    if (!tRow.rows[0]) return sendJson(res, 400, { error: '模板不存在' })
    t = { key: `db:${templateId}`, name: tRow.rows[0].name, phases: phases.rows }
  } else {
    t = await getTemplateByKey(templateKey)
    if (!t) return sendJson(res, 400, { error: '模板不存在' })
  }
  const proj = await db.execute({ sql: 'SELECT id, name FROM projects WHERE id = ?', args: [projectId] })
  if (!proj.rows[0]) return sendJson(res, 404, { error: '项目不存在' })

  const now = new Date()
  const yyyy = now.getFullYear(), mm = String(now.getMonth()+1).padStart(2,'0'), dd = String(now.getDate()).padStart(2,'0')
  const today = `${yyyy}-${mm}-${dd}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  const autoNumber = `CT-${projectId}-${yyyy}${mm}${dd}-${rand}`
  const contractRes = await db.execute({
    sql: 'INSERT INTO contracts (project_id, contract_number, sign_date, contract_amount, payment_method, deposit, warranty_period_months, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [projectId, autoNumber, today, contract_amount || null, '按模板节点', null, null, null]
  })
  const contractId = contractRes.lastInsertRowid
  await db.execute({ sql: "UPDATE projects SET status = 'SCHEME_SETUP' WHERE id = ?", args: [projectId] })

  for (const ph of t.phases) {
    const scheduled_amount = contract_amount ? (contract_amount * (Number(ph.percentage || 0) / 100)) : null
    await db.execute({
      sql: 'INSERT INTO payment_schedules (project_id, contract_id, phase, percentage, scheduled_amount, due_condition, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [projectId, contractId, ph.name, ph.percentage || null, scheduled_amount, '按模板阶段条件', 'PENDING']
    })
    await db.execute({
      sql: "INSERT INTO stages (project_id, name, \"order\", notes, payment_amount, planned_duration_days, major_tasks, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'NOT_STARTED')",
      args: [projectId, ph.name, ph.sequence || null, '', scheduled_amount || 0, ph.default_duration_days || null, ph.default_major_tasks || null]
    })
  }

  return sendJson(res, 200, { contract_id: contractId })
}

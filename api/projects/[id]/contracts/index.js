import { init, db } from '../../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM contracts WHERE project_id = ? ORDER BY id DESC', args: [projectId] })
    return sendJson(res, 200, r.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const r = await db.execute({
      sql: 'INSERT INTO contracts (project_id, contract_number, sign_date, contract_amount, payment_method, deposit, warranty_period_months, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [projectId, b.contract_number || null, b.sign_date || null, b.contract_amount || null, b.payment_method || null, b.deposit || null, b.warranty_period_months || null, b.attachment_url || null]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

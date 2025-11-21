import { init, db } from '../db.js'
import { sendJson, readJson, ensureAdmin } from '../_utils.js'

export default async function handler(req, res) {
  await init()
  if (req.method === 'GET') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const result = await db.execute('SELECT id, name, owner_name, access_code FROM projects ORDER BY id DESC')
    return sendJson(res, 200, result.rows)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const body = await readJson(req)
    const name = body.name?.trim()
    if (!name) return sendJson(res, 400, { error: '项目名称必填' })
    const owner_name = body.owner_name || null
    const access_code = body.access_code || null
    const r = await db.execute({
      sql: 'INSERT INTO projects (name, owner_name, access_code) VALUES (?, ?, ?)',
      args: [name, owner_name, access_code]
    })
    return sendJson(res, 200, { id: r.lastInsertRowid })
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

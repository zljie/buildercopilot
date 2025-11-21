import { init, db } from '../../db.js'
import { sendJson, readJson, ensureAdmin } from '../../_utils.js'

export default async function handler(req, res) {
  await init()
  const projectId = req.query.id
  if (req.method === 'GET') {
    const r = await db.execute({ sql: 'SELECT * FROM property_details WHERE project_id = ? LIMIT 1', args: [projectId] })
    return sendJson(res, 200, r.rows[0] || null)
  }
  if (req.method === 'POST') {
    if (!ensureAdmin(req)) return sendJson(res, 401, { error: '未授权' })
    const b = await readJson(req)
    const exists = await db.execute({ sql: 'SELECT id FROM property_details WHERE project_id = ? LIMIT 1', args: [projectId] })
    if (exists.rows[0]) {
      const id = exists.rows[0].id
      await db.execute({
        sql: 'UPDATE property_details SET property_type=?, address=?, community_name=?, floor=?, total_floors=?, area_sqm=?, layout=? WHERE id=?',
        args: [b.property_type || null, b.address || null, b.community_name || null, b.floor || null, b.total_floors || null, b.area_sqm || null, b.layout || null, id]
      })
      return sendJson(res, 200, { id })
    } else {
      const r = await db.execute({
        sql: 'INSERT INTO property_details (project_id, property_type, address, community_name, floor, total_floors, area_sqm, layout) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [projectId, b.property_type || null, b.address || null, b.community_name || null, b.floor || null, b.total_floors || null, b.area_sqm || null, b.layout || null]
      })
      return sendJson(res, 200, { id: r.lastInsertRowid })
    }
  }
  return sendJson(res, 405, { error: 'Method Not Allowed' })
}

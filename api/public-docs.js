import { init, db } from './db.js'
import { sendJson } from './_utils.js'

export default async function handler(req, res) {
  await init()
  const r = await db.execute('SELECT id, title, content FROM documents WHERE public = 1 ORDER BY id DESC')
  return sendJson(res, 200, r.rows)
}

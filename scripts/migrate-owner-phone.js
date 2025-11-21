import { createClient } from '@libsql/client'
const url = process.env.LIBSQL_URL || 'file:./data.db'
const authToken = process.env.LIBSQL_AUTH_TOKEN
const db = createClient({ url, authToken })
await db.execute('ALTER TABLE projects ADD COLUMN owner_phone TEXT')
const r = await db.execute('PRAGMA table_info(projects)')
console.log(r.rows)

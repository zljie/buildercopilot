import { createClient } from '@libsql/client'

const url = process.env.LIBSQL_URL || 'file:./data.db'
const authToken = process.env.LIBSQL_AUTH_TOKEN
export const db = createClient({ url, authToken })

export async function init() {
  await db.execute(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    owner_name TEXT,
    start_date TEXT,
    end_date TEXT,
    access_code TEXT
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER,
    notes TEXT,
    payment_amount REAL DEFAULT 0,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    stage_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK(type IN ('purchase','todo')) NOT NULL,
    due_date TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(stage_id) REFERENCES stages(id) ON DELETE SET NULL
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    public INTEGER DEFAULT 1,
    project_id INTEGER
  )`)
}

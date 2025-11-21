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
    owner_phone TEXT,
    start_date TEXT,
    end_date TEXT,
    access_code TEXT
  )`)
  try { await db.execute('ALTER TABLE projects ADD COLUMN owner_phone TEXT') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN client_id INTEGER') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN status TEXT') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN total_budget REAL') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN actual_total_cost REAL') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN planned_start_date TEXT') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN planned_end_date TEXT') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN actual_start_date TEXT') } catch {}
  try { await db.execute('ALTER TABLE projects ADD COLUMN actual_end_date TEXT') } catch {}

  await db.execute(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone_number TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TEXT,
    updated_at TEXT
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER,
    notes TEXT,
    payment_amount REAL DEFAULT 0,
    planned_start_date TEXT,
    planned_duration_days INTEGER,
    planned_end_date TEXT,
    assignee_member_id INTEGER,
    major_tasks TEXT,
    status TEXT DEFAULT 'NOT_STARTED',
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  try { await db.execute('ALTER TABLE stages ADD COLUMN planned_start_date TEXT') } catch {}
  try { await db.execute('ALTER TABLE stages ADD COLUMN planned_duration_days INTEGER') } catch {}
  try { await db.execute('ALTER TABLE stages ADD COLUMN planned_end_date TEXT') } catch {}
  try { await db.execute('ALTER TABLE stages ADD COLUMN assignee_member_id INTEGER') } catch {}
  try { await db.execute('ALTER TABLE stages ADD COLUMN major_tasks TEXT') } catch {}
  try { await db.execute("ALTER TABLE stages ADD COLUMN status TEXT DEFAULT 'NOT_STARTED'") } catch {}
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
  await db.execute(`CREATE TABLE IF NOT EXISTS property_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    property_type TEXT,
    address TEXT,
    community_name TEXT,
    floor TEXT,
    total_floors INTEGER,
    area_sqm REAL,
    layout TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    contract_number TEXT,
    sign_date TEXT,
    contract_amount REAL,
    payment_method TEXT,
    deposit REAL,
    warranty_period_months INTEGER,
    attachment_url TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS payment_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    contract_id INTEGER,
    phase TEXT,
    percentage REAL,
    scheduled_amount REAL,
    due_condition TEXT,
    due_date TEXT,
    status TEXT,
    actual_paid_amount REAL,
    paid_date TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(contract_id) REFERENCES contracts(id) ON DELETE SET NULL
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS project_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER,
    display_name TEXT,
    role TEXT,
    join_date TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  try { await db.execute('ALTER TABLE project_members ADD COLUMN display_name TEXT') } catch {}
  await db.execute(`CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    task_id INTEGER,
    reporter_id INTEGER,
    title TEXT,
    description TEXT,
    severity TEXT,
    status TEXT,
    created_at TEXT,
    resolved_at TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY(reporter_id) REFERENCES project_members(id) ON DELETE SET NULL
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS owner_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    contact TEXT,
    status TEXT DEFAULT 'OPEN',
    created_at TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS scheme_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS scheme_template_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sequence INTEGER,
    percentage REAL,
    default_duration_days INTEGER,
    default_major_tasks TEXT,
    FOREIGN KEY(template_id) REFERENCES scheme_templates(id) ON DELETE CASCADE
  )`)

  try {
    const cnt = await db.execute('SELECT COUNT(1) as c FROM scheme_templates')
    if (Number(cnt.rows[0]?.c ?? 0) === 0) {
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
    }
  } catch {}
}
  await db.execute(`CREATE TABLE IF NOT EXISTS scheme_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )`)
  await db.execute(`CREATE TABLE IF NOT EXISTS scheme_template_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sequence INTEGER,
    percentage REAL,
    default_duration_days INTEGER,
    default_major_tasks TEXT,
    FOREIGN KEY(template_id) REFERENCES scheme_templates(id) ON DELETE CASCADE
  )`)

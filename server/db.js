import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'ulsades.db')

let db = null

function getDb() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initSchema(db)
  }
  return db
}

function initSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS ausf_draft (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS ausf_saved (
      id TEXT PRIMARY KEY,
      saved_at TEXT NOT NULL,
      label TEXT NOT NULL,
      form_type TEXT,
      data TEXT NOT NULL
    );
    INSERT OR IGNORE INTO ausf_draft (id, data) VALUES (1, NULL);
  `)
}

export function getDraft() {
  const row = getDb().prepare('SELECT data FROM ausf_draft WHERE id = 1').get()
  if (!row || row.data == null) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

export function saveDraft(data) {
  getDb().prepare('UPDATE ausf_draft SET data = ? WHERE id = 1').run(JSON.stringify(data))
  return true
}

export function clearDraft() {
  getDb().prepare('UPDATE ausf_draft SET data = NULL WHERE id = 1').run()
}

const FORM_TYPE_LABELS = {
  'ausf-0-6': 'AUSF 0-6',
  'ausf-07-17': 'AUSF 07-17',
  'reg-ausf': 'Registration of AUSF',
  'reg-ack': 'Registration of Acknowledgement',
  'child-ack': 'Child Acknowledge',
  'child-ack-lcr': 'LCR Form 1A (Birth-Available)',
  'child-ack-annotation': 'Annotation',
  'child-not-ack': 'Child Not Acknowledged',
  'child-not-ack-lcr': 'LCR Form A1 (Child Not Acknowledged)',
  'child-not-ack-annotation': 'Annotation (Child Not Acknowledged)',
  'child-not-ack-transmittal': 'Transmittal (Child Not Acknowledged)',
  'out-of-town': 'Out-of-Town Transmittal',
}

export function getSavedList() {
  const rows = getDb().prepare('SELECT id, saved_at AS savedAt, label, form_type AS formType, data FROM ausf_saved ORDER BY saved_at DESC').all()
  return rows.map((r) => ({
    id: r.id,
    savedAt: r.savedAt,
    label: r.label,
    formType: r.formType,
    data: JSON.parse(r.data || '{}'),
  }))
}

export function addSaved(data) {
  const id = `ausf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const label = (data.applicantName || data.childFirst || data.formType || 'AUSF').toString().trim() || (FORM_TYPE_LABELS[data.formType] || data.formType || 'AUSF')
  getDb()
    .prepare('INSERT INTO ausf_saved (id, saved_at, label, form_type, data) VALUES (?, ?, ?, ?, ?)')
    .run(id, new Date().toISOString(), label, data.formType || null, JSON.stringify({ ...data }))
  return id
}

export function deleteSaved(id) {
  getDb().prepare('DELETE FROM ausf_saved WHERE id = ?').run(id)
}

export function loadSavedToDraft(id) {
  const row = getDb().prepare('SELECT data FROM ausf_saved WHERE id = ?').get(id)
  if (!row || !row.data) return false
  try {
    saveDraft(JSON.parse(row.data))
    return true
  } catch {
    return false
  }
}

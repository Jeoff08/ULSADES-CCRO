const BASE = import.meta.env.VITE_API_URL || ''

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

export async function apiGetDraft() {
  const { data } = await get('/api/draft')
  return data
}

export async function apiSaveDraft(data) {
  await post('/api/draft', data)
  return true
}

export async function apiClearDraft() {
  await del('/api/draft')
}

export async function apiGetSavedList() {
  const { list } = await get('/api/saved')
  return list || []
}

export async function apiAddSaved(data) {
  const { id } = await post('/api/saved', data)
  return id
}

export async function apiDeleteSaved(id) {
  await del(`/api/saved/${id}`)
}

export async function apiLoadSavedToDraft(id) {
  const { loaded } = await post(`/api/saved/${id}/load`, {})
  return loaded
}

export function isApiEnabled() {
  return Boolean(BASE)
}

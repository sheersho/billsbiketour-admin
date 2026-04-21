export const BASE = import.meta.env.DEV
  ? ''
  : 'https://bike-tour-backend.billsbiketour.workers.dev'

export async function fetchUsers(adminKey) {
  const res = await fetch(`${BASE}/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
  })

  const text = await res.text()

  if (text.trimStart().startsWith('<')) {
    throw new Error(`Server returned an HTML error page (status ${res.status}). The /admin/users endpoint may not exist yet.`)
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON response from server.')
  }

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Request failed with status ${res.status}`)
  }

  return data // expects { sessions: [...], total: number }
}

function parseResponse(text, status) {
  if (text.trimStart().startsWith('<')) {
    throw new Error(`Server returned an HTML error page (status ${status}). The /admin/flags endpoint may not exist yet.`)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON response from server.')
  }
}

export async function fetchFlags(adminKey) {
  const res = await fetch(`${BASE}/admin/flags`, {
    headers: { 'x-admin-key': adminKey },
  })
  const data = parseResponse(await res.text(), res.status)
  if (!res.ok) throw new Error(data.error ?? `Request failed with status ${res.status}`)
  return data // { payments_enabled: boolean }
}

export async function updateFlags(adminKey, flags) {
  const res = await fetch(`${BASE}/admin/flags`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify(flags),
  })
  const data = parseResponse(await res.text(), res.status)
  if (!res.ok) throw new Error(data.error ?? `Request failed with status ${res.status}`)
  return data
}

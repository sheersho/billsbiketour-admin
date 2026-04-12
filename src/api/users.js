export async function fetchUsers(adminKey) {
  const res = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
  })

  const text = await res.text()

  // Guard against HTML error pages (e.g. Cloudflare 404/500)
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

  return data // expects { users: [...], total: number }
}

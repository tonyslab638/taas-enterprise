const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"

export async function apiPost(path: string, body: any, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json()
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}
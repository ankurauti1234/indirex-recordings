export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target) {
    return new Response("Missing url parameter", { status: 400 })
  }

  // Forward Range header (required for seeking)
  const range = request.headers.get("range") || undefined

  const res = await fetch(target, {
    headers: range ? { Range: range } : {},
  })

  const headers = new Headers(res.headers)

  // Ensure correct streaming headers
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Accept-Ranges", "bytes")

  // Browsers expect 206 when Range is used
  const status =
    range && res.status === 200
      ? 206
      : res.status

  return new Response(res.body, {
    status,
    headers,
  })
}

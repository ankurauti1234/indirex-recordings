export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target) {
    return new Response("Missing url parameter", { status: 400 })
  }

  const res = await fetch(target)

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "video/mp4",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes",
    },
  })
}

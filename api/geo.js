export const config = { runtime: "edge" };

export default function handler(request) {
  const country = request.headers.get("x-vercel-ip-country") || null;
  return new Response(JSON.stringify({ country }), {
    headers: { "content-type": "application/json" }
  });
}

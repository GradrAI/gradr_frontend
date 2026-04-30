// Vercel Serverless Function for OG meta tag injection.
// Social media crawlers don't execute JS, so this function
// fetches post data from Sanity and returns HTML with correct meta tags.
// Using .mjs extension to force ESM since package.json has "type": "module".

import https from 'https';

const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || '8bjalpha';
const SANITY_DATASET = process.env.VITE_SANITY_DATASET || 'production';
const SITE_URL = 'https://gradrai.com';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse Sanity response'));
        }
      });
    }).on('error', reject);
  });
}

function buildImageUrl(imageRef) {
  if (!imageRef || !imageRef.asset || !imageRef.asset._ref) return null;

  // Parse Sanity image ref: image-<id>-<dimensions>-<format>
  // Example: image-54ac1f587f4bdc35a8ee163a4cdb38140bf059cd-2848x1504-png
  const ref = imageRef.asset._ref;
  const parts = ref.replace('image-', '').split('-');
  const format = parts.pop();
  const dimensions = parts.pop();
  const id = parts.join('-');

  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}?w=1200&h=630&fit=crop&auto=format`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    res.writeHead(302, { Location: `${SITE_URL}/blog` });
    res.end();
    return;
  }

  try {
    const query = encodeURIComponent(
      `*[_type == "post" && slug.current == "${slug}"][0]{
        title,
        summary,
        coverImage,
        "ogImage": seo.ogImage,
        "authorName": author->name,
        publishedAt
      }`
    );

    const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${query}`;
    const data = await fetchJson(sanityUrl);
    const post = data.result;

    if (!post) {
      res.writeHead(302, { Location: `${SITE_URL}/blog` });
      res.end();
      return;
    }

    const title = post.title || 'GradrAI Blog';
    const description = post.summary || 'Read the latest from GradrAI.';
    const imageSource = post.ogImage || post.coverImage;
    const imageUrl = buildImageUrl(imageSource) || `${SITE_URL}/og-image.png`;
    const canonicalUrl = `${SITE_URL}/blog/${slug}`;
    const publishedAt = post.publishedAt || '';
    const authorName = post.authorName || 'GradrAI';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escapeHtml(title)} | GradrAI Blog</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="GradrAI" />
  <meta property="article:published_time" content="${publishedAt}" />
  <meta property="article:author" content="${escapeHtml(authorName)}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${canonicalUrl}">Read this article on GradrAI</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG handler error:', error);
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GradrAI Blog</title>
  <meta property="og:title" content="GradrAI Blog" />
  <meta property="og:image" content="${SITE_URL}/og-image.png" />
  <meta property="og:url" content="${SITE_URL}/blog/${slug || ''}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
</head>
<body><p>GradrAI Blog</p></body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
}

// api/render-video.js
// Vercel Serverless Function
// Flow: Call Rendervid → Upload MP4 to Cloudflare R2 → Save URL in Supabase

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // server-side key (not anon)
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,      // https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { articleId, headline, newsText, language } = req.body;

  try {
    // ── 1. CALL RENDERVID ──────────────────────────────────
    const renderRes = await fetch('https://api.rendervid.com/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RENDERVID_API_KEY}`,
      },
      body: JSON.stringify({
        template_id: 'news-summary-v1',
        variables: {
          headline,
          news_text: newsText,
          language: language || 'English',
        },
        output_format: 'mp4',
      }),
    });

    const { url: rawVideoUrl } = await renderRes.json();

    // ── 2. DOWNLOAD RENDERED VIDEO ─────────────────────────
    const videoBuffer = Buffer.from(
      await (await fetch(rawVideoUrl)).arrayBuffer()
    );

    // ── 3. UPLOAD TO CLOUDFLARE R2 ─────────────────────────
    const r2Key = `videos/${articleId}_${Date.now()}.mp4`;

    await r2.send(new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME,   // e.g. laance-news-videos
      Key:         r2Key,
      Body:        videoBuffer,
      ContentType: 'video/mp4',
    }));

    // Public URL (requires R2 bucket to have public access enabled)
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${r2Key}`;

    // ── 4. SAVE VIDEO RECORD IN SUPABASE ───────────────────
    const { data, error } = await supabase
      .from('videos')
      .insert({
        article_id: articleId,
        video_url:  publicUrl,
        duration:   '1:30',
        status:     'Published',
      })
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, url: publicUrl, record: data[0] });

  } catch (err) {
    console.error('Render pipeline error:', err);
    return res.status(500).json({ error: err.message });
  }
}

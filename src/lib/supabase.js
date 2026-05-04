import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── ARTICLES ──────────────────────────────────────────────
export async function fetchArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function insertArticle(article) {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select();
  return { data, error };
}

// ── AI SEARCH LOGS ────────────────────────────────────────
export async function logAiSearch(userEmail, query, summary, language, country) {
  const { data, error } = await supabase
    .from('ai_news_reports')
    .insert({ user_email: userEmail, search_query: query, summary, language, country });
  return { data, error };
}

// ── VIDEOS ────────────────────────────────────────────────
export async function insertVideo(articleId, videoUrl, duration = '1:30') {
  const { data, error } = await supabase
    .from('videos')
    .insert({ article_id: articleId, video_url: videoUrl, duration, status: 'Published' })
    .select();
  return { data, error };
}

export async function fetchVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, articles(title, image_url)')
    .order('created_at', { ascending: false });
  return { data, error };
}

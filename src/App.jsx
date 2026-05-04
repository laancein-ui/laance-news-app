import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Share2, X, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { supabase, insertArticle, logAiSearch } from './lib/supabase';

const CATEGORIES = ['UAE', 'World', 'Business', 'Tech', 'Life', 'Sports', 'Entertainment'];

const IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780efad01a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496065187959-7f07b8353c55?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
];

const AI_HEADLINES = [
  { cat: 'UAE', title: 'UAE intercepts cruise missiles over territorial waters as tensions escalate with Iran', snippet: 'UAE air defence systems successfully neutralised multiple threats, the government confirmed late Sunday, urging residents to remain calm.' },
  { cat: 'World', title: 'Global ceasefire talks enter Day 27: US, Israel and Iran negotiators meet in Geneva', snippet: 'Senior diplomats from all three nations arrived for critical talks expected to reshape the regional security architecture for decades.' },
  { cat: 'Business', title: 'UAE economy surges 6.2% as non-oil sectors lead recovery in Q1 2026', snippet: 'Tourism, fintech and advanced manufacturing drove the fastest quarterly growth since 2014, the Ministry of Economy announced today.' },
  { cat: 'Tech', title: 'Five technology trends that will define 2026 — and the cities bold enough to build them', snippet: 'AI integration, quantum computing access, autonomous transport, green data centres, and spatial computing top the list for 2026.' },
  { cat: 'UAE', title: 'UAE schools revert to distance learning until May 8 after renewed Iranian attacks', snippet: 'The Ministry of Education issued the directive following the Ministry of Interior\'s advice to limit public movement during elevated alert.' },
  { cat: 'Business', title: 'Gold prices in UAE steady after slight dip amid ceasefire optimism in Gulf markets', snippet: 'Dubai gold souk traders reported stable volumes as investors await confirmation of formal negotiations between regional stakeholders.' },
  { cat: 'Life', title: 'WhatsApp in UAE: Banking ban, private chat rules and new web calling feature explained', snippet: 'Regulators issued updated guidelines clarifying the scope of digital communication laws and VoIP access within the Emirates.' },
  { cat: 'Sports', title: 'UAE national football squad qualifies for Asia Cup semi-finals after dramatic win', snippet: 'A late goal secured a 2-1 victory over South Korea, sending thousands of fans into celebration across Dubai and Abu Dhabi.' },
  { cat: 'World', title: 'Iran Guards warn of "impossible" military options as nuclear talks resume in Vienna', snippet: 'The IRGC issued a blunt warning to Western powers while diplomatic channels remained open for a seventh round of indirect talks.' },
  { cat: 'Tech', title: 'AI startup from Abu Dhabi raises $400M to build autonomous newsroom technology', snippet: 'Laance Intelligence secured Series C funding to expand its AI-driven media operations across 14 languages and 60 countries.' },
  { cat: 'UAE', title: 'Abu Dhabi deploys AI system to predict road accidents and control ambulance signals', snippet: 'The smart transport initiative will reduce emergency response times by 40%, according to the Abu Dhabi Department of Transport.' },
  { cat: 'Entertainment', title: 'Coldplay announces two additional Dubai shows after 90,000-ticket sellout in 4 hours', snippet: 'The British rock band will perform at the Expo City Arena on June 28 and 29, with tickets available via Platinumlist from Monday.' },
];

const YOUTUBE_IDS = ['ZlNFpri-Y40', 'phClqoalTu0', 'OnoNITE-CLc', 'bWmSFCl__T8'];

function makeArticle(src, idx, isNew = false) {
  return {
    id: `${Date.now()}_${idx}`,
    cat: src.cat,
    title: src.title,
    snippet: src.snippet,
    content: `${src.snippet}\n\nFull AI-generated report: In-depth analysis of "${src.title}" reveals cascading regional and international implications. Senior officials confirmed the development during a press briefing, stressing that systematic policy responses are already underway.\n\nExperts tracking the story note a significant shift from previous positions, with both domestic and international stakeholders recalibrating strategies in real time. Data from the latest situational reports indicate accelerated timelines across all affected sectors.\n\nMore updates will be published as this AI-monitored situation develops.`,
    image: IMAGES[idx % IMAGES.length],
    time: 'Just Now',
    isNew,
    youtubeId: YOUTUBE_IDS[idx % YOUTUBE_IDS.length],
  };
}

const INITIAL_ARTICLES = AI_HEADLINES.map((h, i) => makeArticle(h, i, false));

const TICKER_ITEMS = [
  'UAE on high alert after Iranian missile attack — schools switch to distance learning',
  'Gold: AED 310.50/g | Forex: 1 USD = 3.6725 AED',
  'Ceasefire Day 27: Live updates from Geneva talks',
  'UAE economy grows 6.2% in Q1 2026 — non-oil sectors lead',
  'Abu Dhabi AI system predicts road accidents in real time',
  'Coldplay adds 2 Dubai shows after instant sellout',
  'Iran nuclear talks resume — IRGC issues new warning',
];

// Normalise a raw Supabase row to the shape the UI expects
function rowToArticle(row) {
  return {
    id: row.id,
    cat: row.cat,
    title: row.title,
    snippet: row.snippet || '',
    content: row.content || row.snippet || '',
    image: row.image || IMAGES[0],
    time: row.time_label || 'Just Now',
    isNew: row.is_new || false,
    youtubeId: row.youtube_id || YOUTUBE_IDS[0],
    source: row.source || 'AI Reporter',
  };
}

export default function App() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [dbReady, setDbReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [videoArticle, setVideoArticle] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiStatus, setAiStatus] = useState('Connecting to Supabase backend...');
  const [newCount, setNewCount] = useState(0);
  const counterRef = useRef(0);
  const sharedRef = useRef({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── LOAD ARTICLES FROM SUPABASE ON STARTUP ────────────
  useEffect(() => {
    async function loadArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);

      if (error) {
        // Supabase not configured yet — fall back to local seed data
        setAiStatus('AI Reporter live (local mode — add Supabase keys to enable cloud backend)');
        return;
      }

      if (data && data.length > 0) {
        setArticles(data.map(rowToArticle));
        setDbReady(true);
        setAiStatus(`AI Reporter live — ${data.length} articles loaded from Supabase`);
      } else {
        // DB is connected but empty — seed with initial articles
        setDbReady(true);
        setAiStatus('AI Reporter live — seeding Supabase with initial articles...');
        for (let i = 0; i < INITIAL_ARTICLES.length; i++) {
          const a = INITIAL_ARTICLES[i];
          await insertArticle({
            cat: a.cat, title: a.title, snippet: a.snippet,
            content: a.content, image: a.image,
            youtube_id: a.youtubeId, time_label: a.time, is_new: false,
          });
        }
        setAiStatus('AI Reporter live — Supabase seeded ✓');
      }
    }
    loadArticles();
  }, []);

  // ── SUPABASE REAL-TIME: new rows push to all users ────
  useEffect(() => {
    const channel = supabase
      .channel('articles-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'articles' }, (payload) => {
        const fresh = rowToArticle(payload.new);
        setArticles(prev => [fresh, ...prev.slice(0, 59)]);
        setNewCount(n => n + 1);
        setAiStatus(`AI Reporter published: "${fresh.title.slice(0, 60)}..." — ${new Date().toLocaleTimeString()}`);
        setTimeout(() => {
          setArticles(prev => prev.map(a => a.id === fresh.id ? { ...a, isNew: false } : a));
        }, 3000);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // ── AI AUTO-PUBLISHER: saves to Supabase every 30s ───
  useEffect(() => {
    const interval = setInterval(async () => {
      counterRef.current += 1;
      const src = AI_HEADLINES[counterRef.current % AI_HEADLINES.length];
      const article = makeArticle(
        { ...src, title: src.title + ' — AI Update #' + counterRef.current },
        counterRef.current, true
      );

      if (dbReady) {
        // Save to Supabase → real-time listener picks it up for all users
        await insertArticle({
          cat: article.cat, title: article.title, snippet: article.snippet,
          content: article.content, image: article.image,
          youtube_id: article.youtubeId, time_label: 'Just Now', is_new: true,
        });
      } else {
        // Local fallback
        setArticles(prev => [article, ...prev.slice(0, 49)]);
        setNewCount(n => n + 1);
        setAiStatus(`AI Reporter published update #${counterRef.current} — ${new Date().toLocaleTimeString()}`);
        setTimeout(() => {
          setArticles(prev => prev.map(a => a.id === article.id ? { ...a, isNew: false } : a));
        }, 3000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [dbReady]);

  // ── SHARE LINK ────────────────────────────────────────
  const handleShare = (article, e) => {
    if (e) e.stopPropagation();
    sharedRef.current[article.id] = article;
    const link = `${window.location.origin}?share=${article.id}`;
    navigator.clipboard.writeText(link).catch(() => {});
    showToast('Share link copied to clipboard!');
  };

  // ── AI SEARCH: generates fresh topic-specific articles instantly ──
  const handleSearch = (q) => {
    const query = (q || searchQuery).trim();
    if (!query) { setSearchResults(null); return; }

    setIsSearching(true);
    setSearchResults(null);
    setActiveCategory('All');

    setTimeout(() => {
      const cats = ['UAE', 'World', 'Business', 'Tech', 'Life', 'Sports', 'Entertainment', 'World'];
      const sources = ['BBC News', 'Reuters', 'CNN', 'Al Jazeera', 'AP News', 'Khaleej Times', 'The Guardian', 'Bloomberg'];
      const timeAgo = ['Just Now', '4 mins ago', '12 mins ago', '27 mins ago', '45 mins ago', '1 hour ago', '2 hours ago', '3 hours ago'];

      const templates = [
        { suffix: 'Breaking: first reports emerge', lead: `Initial confirmed developments on "${query}" have surfaced across global news networks. Official statements are being prepared as agencies coordinate response strategies.` },
        { suffix: 'Full timeline — what happened and when', lead: `A complete chronological breakdown of "${query}" shows a rapid escalation beginning early this week. Analysts tracking the story note significant turning points at each stage.` },
        { suffix: 'What experts are saying right now', lead: `Senior analysts commenting on "${query}" highlighted three critical dimensions: strategic alignment, economic exposure, and the humanitarian dimension currently unfolding.` },
        { suffix: 'Live updates: latest news every minute', lead: `Live monitoring of "${query}" continues as multiple international media channels now maintain dedicated coverage teams. Updates expected within the next 15 minutes.` },
        { suffix: 'Impact on UAE and Gulf region explained', lead: `The direct implications of "${query}" on the UAE and wider Gulf region are already being assessed by regional economists and government advisers.` },
        { suffix: 'Key facts and full background report', lead: `To fully understand "${query}", it is essential to trace its origins back over the past 18 months. This deep-dive provides all relevant context in one comprehensive AI-compiled report.` },
        { suffix: 'International reaction and diplomatic response', lead: `Governments across Europe, Asia, and the Americas have issued formal statements on "${query}", with coordinated multilateral responses now being discussed at the UN Security Council.` },
        { suffix: 'What happens next — AI forecast and analysis', lead: `Based on real-time pattern recognition across 200 data sources, the AI forecast for "${query}" identifies three probable scenarios over the coming 72 hours.` },
      ];

      const freshArticles = templates.map((t, i) => ({
        id: `search_${Date.now()}_${i}`,
        cat: cats[i],
        title: `${query} — ${t.suffix}`,
        snippet: t.lead,
        content: `${t.lead}\n\nExtended AI analysis: Coverage of "${query}" continues to evolve rapidly. Correspondent teams embedded across ${cats[i]} report that local conditions are shifting in real time, with authorities urging measured responses from the public.\n\nKey data points compiled by the AI reporter:\n• Story first emerged: ${timeAgo[i]}\n• Currently monitored by: ${sources[i]}\n• Region impact level: High\n• Next update expected: within 15 minutes\n\nThis AI-compiled article will be updated automatically as new information becomes available across all monitored broadcast channels.`,
        image: IMAGES[i % IMAGES.length],
        time: timeAgo[i],
        source: sources[i],
        isNew: true,
        youtubeId: YOUTUBE_IDS[i % YOUTUBE_IDS.length],
      }));

      // Log the search query to Supabase
      if (dbReady) {
        logAiSearch(query);
        // Save each generated article to Supabase
        freshArticles.forEach(a => insertArticle({
          cat: a.cat, title: a.title, snippet: a.snippet,
          content: a.content, image: a.image,
          youtube_id: a.youtubeId, time_label: a.time, is_new: true,
        }));
      } else {
        // Local fallback
        setArticles(prev => [...freshArticles, ...prev].slice(0, 60));
      }
      setSearchResults({ query, items: freshArticles });
      setIsSearching(false);
      setAiStatus(`AI Reporter generated ${freshArticles.length} fresh articles for "${query}"`);
      setNewCount(n => n + freshArticles.length);
      showToast(`AI generated ${freshArticles.length} live articles for "${query}"`);
    }, 600);
  };

  const displayArticles = searchResults
    ? searchResults.items
    : activeCategory === 'All'
      ? articles
      : articles.filter(a => a.cat === activeCategory);

  const heroArticle = displayArticles[0];
  const sideArticles = displayArticles.slice(1, 5);
  const gridArticles = displayArticles.slice(5);

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh' }}>
      {toast && (
        <div className="kt-toast">
          <CheckCircle size={16} color="#22c55e" />
          {toast}
        </div>
      )}

      {/* TOP BAR */}
      <div className="kt-topbar">
        <div className="kt-topbar-left">
          <span>Mon, May 4, 2026 | Dhu al-Qadah 16, 1447</span>
          <span className="kt-live-badge">● LIVE</span>
          <span>DXB 31°C</span>
        </div>
        <div className="kt-topbar-right">
          <span>Gold: AED 310.50/g</span>
          <span>USD: 3.6725</span>
          <span>Sign In</span>
        </div>
      </div>

      {/* HEADER */}
      <div className="kt-header">
        <div className="kt-header-inner">
          <div className="kt-brand" onClick={() => { setSearchResults(null); setActiveCategory('All'); }}>
            <div className="kt-brand-name">LAANCE NEWS</div>
            <div className="kt-brand-tagline">Voice of the World · AI-Powered · Since 2026</div>
          </div>
          <div className="kt-search-bar">
            <input
              className="kt-search-input"
              placeholder="Search news..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="kt-search-btn" onClick={() => handleSearch()}>
              <Search size={16} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="kt-nav">
        <div className="kt-nav-inner">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`kt-nav-item ${activeCategory === cat && !searchResults ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setSearchResults(null); setSearchQuery(''); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* BREAKING TICKER */}
      <div className="kt-ticker">
        <div className="kt-ticker-label">Breaking</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="kt-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="kt-ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI STATUS BAR */}
      <div className="kt-ai-bar">
        <div className="kt-ai-bar-inner">
          <div className="ai-dot" />
          <Zap size={13} color="#22c55e" />
          <span style={{ color: '#22c55e', fontWeight: 600 }}>AI AUTO-REPORTER:</span>
          <span style={{ color: '#94a3b8' }}>{aiStatus}</span>
          {newCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#c8102e', color: 'white', padding: '2px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: 700 }}>
              +{newCount} NEW
            </span>
          )}
        </div>
      </div>

      {/* SEARCH STATUS BAR */}
      {(searchResults || isSearching) && (
        <div style={{ background: 'white', borderBottom: '1px solid #e2e2e2', padding: '12px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isSearching ? (
              <span style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #e2e2e2', borderTop: '2px solid #c8102e', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                AI is generating fresh news articles for "<strong>{searchQuery}</strong>"...
              </span>
            ) : (
              <span style={{ fontSize: '14px', color: '#666' }}>
                AI generated <strong>{searchResults.items.length}</strong> fresh articles for "<strong>{searchResults.query}</strong>"
              </span>
            )}
            {!isSearching && (
              <button onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                style={{ fontSize: '13px', color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Clear ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="kt-main">
        {displayArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <RefreshCw size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
            <p>AI Reporter is generating fresh content...</p>
          </div>
        ) : (
          <>
            {/* HERO GRID */}
            <div className="kt-hero-grid" style={{ marginBottom: 24 }}>
              {/* Main hero */}
              {heroArticle && (
                <div className="kt-hero-main" onClick={() => setActiveArticle(heroArticle)}>
                  <img src={heroArticle.image} alt={heroArticle.title} />
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#c8102e', marginBottom: 8 }}>
                    {heroArticle.cat} <span className="kt-ai-badge" style={{ marginLeft: 6 }}>AI</span>
                  </div>
                  <div style={{ fontFamily: "'Merriweather', serif", fontSize: 22, fontWeight: 900, lineHeight: 1.3, color: '#1a1a1a', marginBottom: 12 }}>
                    {heroArticle.title}
                  </div>
                  <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{heroArticle.snippet}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="kt-video-btn" onClick={e => { e.stopPropagation(); setVideoArticle(heroArticle); }}>
                      <Play size={14} fill="white" /> Watch Video
                    </button>
                    <button className="kt-share-btn" onClick={e => handleShare(heroArticle, e)}>
                      <Share2 size={14} /> Share
                    </button>
                  </div>
                </div>
              )}

              {/* Side articles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#e2e2e2' }}>
                {sideArticles.map(a => (
                  <div key={a.id} className={`kt-hero-side ${a.isNew ? 'new-article' : ''}`} onClick={() => setActiveArticle(a)}>
                    <img src={a.image} alt={a.title} style={{ width: 90, height: 70, objectFit: 'cover', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#c8102e', letterSpacing: 1, marginBottom: 4 }}>
                        {a.cat} {a.isNew && <span className="kt-ai-badge" style={{ marginLeft: 4 }}>NEW</span>}
                      </div>
                      <div style={{ fontFamily: "'Merriweather', serif", fontSize: 13.5, fontWeight: 700, lineHeight: 1.4, color: '#1a1a1a' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="kt-sidebar">
                <div className="kt-section-title" style={{ fontSize: 14 }}>AI Latest Updates</div>
                {articles.slice(0, 8).map(a => (
                  <div key={a.id}
                    style={{ padding: '10px 0', borderBottom: '1px solid #e2e2e2', cursor: 'pointer' }}
                    onClick={() => setActiveArticle(a)}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#c8102e', textTransform: 'uppercase', letterSpacing: 1 }}>{a.cat}</div>
                    <div style={{ fontFamily: "'Merriweather', serif", fontSize: 13, fontWeight: 700, lineHeight: 1.35, color: '#1a1a1a', marginTop: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEWS GRID */}
            <div className="kt-section-title">
              More Stories <span onClick={() => setActiveCategory('All')}>View All →</span>
            </div>
            <div className="kt-news-grid">
              {gridArticles.map(a => (
                <div key={a.id} className={`kt-card ${a.isNew ? 'new-article' : ''}`} onClick={() => setActiveArticle(a)}>
                  <img src={a.image} alt={a.title} />
                  <div className="kt-card-body">
                    <div className="kt-card-cat">
                      {a.cat} {a.isNew && <span className="kt-ai-badge" style={{ marginLeft: 6 }}>NEW</span>}
                    </div>
                    <div className="kt-card-title">{a.title}</div>
                    <div className="kt-card-snippet">{a.snippet}</div>
                    <div className="kt-card-meta">
                      <span>{a.time}</span>
                      <span className="kt-ai-badge">AI Reporter</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ background: '#1a1a1a', color: '#999', padding: '32px 24px', fontSize: 13 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Merriweather',serif", fontSize: 20, fontWeight: 900, color: '#c8102e', marginBottom: 6 }}>LAANCE NEWS</div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666' }}>AI-Powered · Voice of the World · Since 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['UAE', 'World', 'Business', 'Tech', 'Life', 'Sports'].map(c => (
              <span key={c} style={{ cursor: 'pointer' }} onClick={() => setActiveCategory(c)}>{c}</span>
            ))}
          </div>
          <div>©2026 Laance Intelligence LLC. Powered by Rendervid · Supabase · Vercel · Cloudflare R2</div>
        </div>
      </div>

      {/* ARTICLE DETAIL MODAL */}
      {activeArticle && (
        <div className="kt-modal-backdrop" onClick={() => setActiveArticle(null)}>
          <div className="kt-modal" onClick={e => e.stopPropagation()}>
            <button className="kt-modal-close" onClick={() => setActiveArticle(null)}>✕</button>
            <div className="kt-modal-cat">{activeArticle.cat} · <span className="kt-ai-badge">AI Reporter</span></div>
            <div className="kt-modal-title">{activeArticle.title}</div>
            <div className="kt-modal-byline">
              <span>By Laance AI Reporter</span>
              <span>·</span>
              <span>{activeArticle.time}</span>
            </div>
            <img src={activeArticle.image} alt={activeArticle.title} />
            <div className="kt-modal-body">
              {activeArticle.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e2e2' }}>
              <button className="kt-video-btn" onClick={() => { setVideoArticle(activeArticle); setActiveArticle(null); }}>
                <Play size={14} fill="white" /> Watch AI Video
              </button>
              <button className="kt-share-btn" onClick={() => handleShare(activeArticle)}>
                <Share2 size={14} /> Share Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL — Real YouTube embed */}
      {videoArticle && (
        <div className="kt-modal-backdrop" onClick={() => setVideoArticle(null)}>
          <div className="kt-modal" style={{ maxWidth: 820, padding: 24 }} onClick={e => e.stopPropagation()}>
            <button className="kt-modal-close" onClick={() => setVideoArticle(null)}>✕</button>
            <div className="kt-modal-cat">{videoArticle.cat} · AI Video Broadcast</div>
            <div className="kt-modal-title" style={{ fontSize: 20, marginBottom: 16 }}>{videoArticle.title}</div>
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${videoArticle.youtubeId}?autoplay=1&rel=0`}
                title={videoArticle.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="kt-share-btn" onClick={() => handleShare(videoArticle)}>
                <Share2 size={14} /> Share Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

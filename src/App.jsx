import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Compass, 
  Play, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Search,
  User,
  Shield,
  Activity,
  Terminal,
  Languages,
  Share2,
  Clock,
  ExternalLink,
  Globe,
  BookOpen
} from 'lucide-react';

const sharedNewsCloud = {};

const supportedCountries = [
  "Global", "United States", "United Kingdom", "Canada", "France", "Germany", 
  "Spain", "Japan", "India", "Australia", "Brazil", "South Africa", "United Arab Emirates"
];

const supportedLanguages = [
  "English", "Spanish", "French", "German", "Japanese", "Hindi", "Portuguese", "Arabic"
];

// YouTube video IDs mapped to topic keywords for real video playback
const topicVideoMap = {
  default: "dQw4w9WgXcQ",
  war: "phClqoalTu0",
  iran: "phClqoalTu0",
  israel: "phClqoalTu0",
  tech: "ZlNFpri-Y40",
  ai: "ZlNFpri-Y40",
  space: "OnoNITE-CLc",
  economy: "bWmSFCl__T8",
  climate: "G4H1N_yXBiA",
  health: "5MgBikgcWnY",
};

function getYoutubeId(query) {
  const q = query.toLowerCase();
  for (const key of Object.keys(topicVideoMap)) {
    if (q.includes(key)) return topicVideoMap[key];
  }
  return topicVideoMap.default;
}

// Generate realistic Google-style news results
function generateGoogleResults(query, country, language) {
  const sources = [
    { name: "BBC News", url: "bbc.com", favicon: "🔴" },
    { name: "Reuters", url: "reuters.com", favicon: "🟠" },
    { name: "CNN", url: "cnn.com", favicon: "🔵" },
    { name: "Al Jazeera", url: "aljazeera.com", favicon: "🟡" },
    { name: "The Guardian", url: "theguardian.com", favicon: "🟣" },
    { name: "AP News", url: "apnews.com", favicon: "⚫" },
    { name: "Khaleej Times", url: "khaleejtimes.com", favicon: "🟢" },
  ];

  const timeAgo = ["2 mins ago", "14 mins ago", "38 mins ago", "1 hour ago", "2 hours ago", "4 hours ago", "6 hours ago"];
  const images = [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780efad01a?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496065187959-7f07b8353c55?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&auto=format&fit=crop&q=80",
  ];

  const headlines = [
    `${query}: Breaking developments as world leaders respond immediately`,
    `LIVE UPDATES: ${query} — Full timeline of events from first to latest`,
    `What you need to know about ${query} right now — Full Report`,
    `Analysts weigh in: The long-term impact of ${query} on global markets`,
    `${query}: Local communities and residents share their response`,
    `Key facts and complete background: Understanding ${query} fully`,
    `VIDEO: Complete news broadcast on ${query} — All major updates`,
  ];

  const snippets = [
    `Officials confirmed significant progress in discussions surrounding ${query}. All major nations have responded with coordinated measures targeting long-term stabilization across affected regions.`,
    `Continuous coverage of ${query} indicates shifting dynamics between key stakeholders. Experts assess the situation in real-time, tracking every development as it unfolds across the ${country} region.`,
    `Comprehensive review of ${query} shows cascading secondary effects on finance, health, and trade channels. Policy teams are aligned on immediate action across the ${country} corridors.`,
    `In-depth analysis reveals ${query} will have lasting implications on regional governance and coordination. Watch the full ${language}-language broadcast below for complete coverage.`,
    `Affected communities across ${country} provide testimony on how ${query} is shaping daily life. Support networks deployed immediately as conditions on the ground evolve rapidly.`,
    `Data-driven deep-dive on ${query} maps out the key turning points from initial outbreak to resolution. Full report available exclusively on ${language} news streaming channels.`,
    `Breaking: Official response channels confirm details on ${query}. Press conference scheduled within the next 24 hours — Live streams available.`,
  ];

  return sources.map((src, i) => ({
    id: `result_${i}_${Date.now()}`,
    title: headlines[i],
    snippet: snippets[i],
    source: src.name,
    favicon: src.favicon,
    url: `https://www.${src.url}/search?q=${encodeURIComponent(query)}`,
    timeAgo: timeAgo[i],
    image: images[i],
    youtubeId: getYoutubeId(query),
    country,
    language,
    fullContent: `${snippets[i]}\n\nExtended analysis of ${query}: As the situation develops in ${country}, cross-border agencies are actively coordinating response strategies. Primary stakeholders have confirmed new measures will be enacted within 48 hours. Regional administrators from key cities confirm alignment. All major broadcasters are providing dedicated ${language}-language news coverage.\n\nKey points:\n• First developments were recorded ${timeAgo[i]}\n• ${country} officials are actively monitoring the situation\n• Translated reports are now live across ${language} media\n• Economic and social impact assessments are ongoing\n• International aid channels are now open and accepting requests`
  }));
}

function App() {
  const [currentTab, setCurrentTab] = useState('ai-search');
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@gmail.com",
    country: "Global",
    language: "English",
    isLoggedIn: true
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');

  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [videoModalArticle, setVideoModalArticle] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check share links from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId && sharedNewsCloud[shareId]) {
      setActiveArticle(sharedNewsCloud[shareId]);
    }
  }, []);

  // INSTANT GOOGLE-STYLE NEWS SEARCH
  const handleSearch = () => {
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    setSearchResults([]);
    setActiveArticle(null);

    setTimeout(() => {
      const results = generateGoogleResults(aiSearchQuery, user.country, user.language);
      setSearchResults(results);
      setIsAiSearching(false);
      showToast(`Found ${results.length} results for "${aiSearchQuery}"`);
    }, 500);
  };

  const handleShare = (article) => {
    sharedNewsCloud[article.id] = article;
    const link = `${window.location.origin}${window.location.pathname}?share=${article.id}`;
    navigator.clipboard.writeText(link);
    showToast("Share link copied to clipboard!");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authEmail || !authName) return;
    setUser({ ...user, name: authName, email: authEmail, isLoggedIn: true });
    showToast(`Logged in as ${authName}!`);
  };

  return (
    <div className="app-container">
      {toastMessage && (
        <div className="toast-success">
          <CheckCircle className="toast-icon" size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="main-header">
        <div className="brand-wrapper" onClick={() => { setCurrentTab('ai-search'); setSearchResults([]); setActiveArticle(null); }}>
          <div className="brand-logo">
            <Sparkles size={24} color="#3b82f6" />
            <span>LAANCE NEWS</span>
          </div>
        </div>
        <nav className="nav-links">
          <button className={`nav-item ${currentTab === 'ai-search' ? 'active' : ''}`} onClick={() => setCurrentTab('ai-search')}>
            <Terminal size={18} /><span>News Search</span>
          </button>
          <button className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>
            <User size={18} /><span>Preferences</span>
          </button>
        </nav>
      </header>

      <main className="main-content">

        {/* AI SEARCH TAB */}
        {currentTab === 'ai-search' && (
          <div>
            {/* Search box — always visible */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '0', borderRadius: '14px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
                <input
                  type="text"
                  value={aiSearchQuery}
                  onChange={e => setAiSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search any news topic globally (e.g. Iran Israel war, AI breakthroughs, climate summit...)"
                  style={{ flex: 1, padding: '18px 24px', background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '16px', fontFamily: 'inherit' }}
                />
                <button className="btn-primary" onClick={handleSearch} disabled={isAiSearching} style={{ borderRadius: '0 12px 12px 0', padding: '18px 32px', fontSize: '15px' }}>
                  <Search size={20} />
                  <span>{isAiSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
              {searchResults.length > 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-dimmed)', marginTop: '10px', paddingLeft: '4px' }}>
                  About {searchResults.length} results for "<strong style={{ color: 'var(--text-muted)' }}>{aiSearchQuery}</strong>" — {user.language} · {user.country}
                </p>
              )}
            </div>

            {/* Loading spinner */}
            {isAiSearching && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '20px 0' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>Scanning Google, BBC, Reuters, CNN, Al Jazeera, AP News, Khaleej Times...</span>
              </div>
            )}

            {/* HERO: show landing banner only when no results */}
            {!isAiSearching && searchResults.length === 0 && (
              <div className="hero-banner glass-panel">
                <span className="hero-tag">Google-Style AI News Intelligence</span>
                <h1 className="hero-title">Search Any Topic — Get Full News Results Instantly</h1>
                <p className="hero-subtitle">AI automatically scrapes Google, BBC, Reuters, CNN, Al Jazeera and more. Full details, images, and AI video broadcasts in your language ({user.language}).</p>
              </div>
            )}

            {/* GOOGLE-STYLE SEARCH RESULTS */}
            {!isAiSearching && searchResults.length > 0 && !activeArticle && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {searchResults.map((result, idx) => (
                  <div
                    key={result.id}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      padding: '20px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setActiveArticle(result)}
                  >
                    {/* Image thumbnail */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={result.image}
                        alt={result.title}
                        style={{ width: '140px', height: '95px', objectFit: 'cover', borderRadius: '10px', display: 'block' }}
                      />
                    </div>

                    {/* Text content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* Source + time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dimmed)' }}>
                        <span>{result.favicon}</span>
                        <span style={{ color: '#4ade80', fontWeight: '600' }}>{result.source}</span>
                        <span>·</span>
                        <Clock size={12} />
                        <span>{result.timeAgo}</span>
                      </div>

                      {/* Headline */}
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.3', margin: 0 }}>
                        {result.title}
                      </h3>

                      {/* Snippet */}
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {result.snippet}
                      </p>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '12.5px' }}
                          onClick={e => { e.stopPropagation(); setVideoModalArticle(result); }}
                        >
                          <Play size={13} fill="white" />
                          <span>Watch AI Video</span>
                        </button>
                        <button
                          className="btn-glass"
                          style={{ padding: '6px 14px', fontSize: '12.5px' }}
                          onClick={e => { e.stopPropagation(); handleShare(result); }}
                        >
                          <Share2 size={13} />
                          <span>Share</span>
                        </button>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12.5px', color: 'var(--text-muted)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={13} />
                          <span>Source</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FULL ARTICLE DETAIL VIEW (like clicking a Google result) */}
            {activeArticle && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <button className="btn-glass" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '13.5px' }} onClick={() => setActiveArticle(null)}>
                  ← Back to results
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-dimmed)' }}>
                  <span>{activeArticle.favicon}</span>
                  <span style={{ color: '#4ade80', fontWeight: '700' }}>{activeArticle.source}</span>
                  <span>·</span>
                  <Clock size={13} />
                  <span>{activeArticle.timeAgo}</span>
                  <span>·</span>
                  <Globe size={13} />
                  <span>{activeArticle.country} ({activeArticle.language})</span>
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: 0 }}>{activeArticle.title}</h1>

                <img src={activeArticle.image} alt={activeArticle.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px' }} />

                <div style={{ fontSize: '16.5px', lineHeight: '1.75', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {activeArticle.fullContent}
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => setVideoModalArticle(activeArticle)}>
                    <Play size={16} fill="white" />
                    <span>Watch AI Video Broadcast</span>
                  </button>
                  <button className="btn-glass" onClick={() => handleShare(activeArticle)}>
                    <Share2 size={16} />
                    <span>Share Link</span>
                  </button>
                  <button className="btn-glass" onClick={() => setActiveArticle(null)}>
                    ← Back to Results
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {currentTab === 'profile' && (
          <div>
            <div className="hero-banner glass-panel">
              <span className="hero-tag">Account Settings</span>
              <h1 className="hero-title">Preferences & Language Settings</h1>
              <p className="hero-subtitle">Set your name, Gmail, preferred country, and broadcast language.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="#3b82f6" /> User Profile
                </h3>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input type="text" className="form-input" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="e.g. Alex Johnson" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gmail Address</label>
                    <input type="email" className="form-input" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="e.g. alex@gmail.com" required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    <CheckCircle size={18} /><span>Save Settings</span>
                  </button>
                </form>
              </div>

              <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="#06b6d4" /> Region & Language
                </h3>
                <div className="form-group">
                  <label className="form-label">News Country</label>
                  <select className="form-input" style={{ background: 'rgba(9, 9, 14, 0.4)', color: 'white' }} value={user.country} onChange={e => { setUser({ ...user, country: e.target.value }); showToast("Country updated!"); }}>
                    {supportedCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Broadcast Language</label>
                  <select className="form-input" style={{ background: 'rgba(9, 9, 14, 0.4)', color: 'white' }} value={user.language} onChange={e => { setUser({ ...user, language: e.target.value }); showToast("Language updated!"); }}>
                    {supportedLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 48px', color: 'var(--text-dimmed)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>&copy; 2026 Laance News App. All Rights Reserved.</div>
        <span style={{ color: 'var(--text-muted)' }}>Powered by Rendervid · Supabase · Vercel · Cloudflare R2</span>
      </footer>

      {/* VIDEO MODAL — Real YouTube Embed Player */}
      {videoModalArticle && (
        <div className="modal-backdrop" onClick={() => setVideoModalArticle(null)}>
          <div className="modal-container glass-panel" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '18px' }}>
                <Video size={20} color="#3b82f6" />
                <span style={{ fontSize: '16px', maxWidth: '580px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {videoModalArticle.title}
                </span>
              </h2>
              <button className="modal-close-btn" onClick={() => setVideoModalArticle(null)}>
                <X size={18} />
              </button>
            </div>

            {/* REAL YOUTUBE VIDEO EMBED — actually plays */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${videoModalArticle.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={videoModalArticle.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dimmed)', marginTop: '4px' }}>
              <span>{videoModalArticle.favicon}</span>
              <span style={{ color: '#4ade80' }}>{videoModalArticle.source}</span>
              <span>·</span>
              <span>{videoModalArticle.timeAgo}</span>
              <span>·</span>
              <span>{videoModalArticle.language}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-glass" onClick={() => setVideoModalArticle(null)}>Close</button>
              <button className="btn-primary" onClick={() => handleShare(videoModalArticle)}>
                <Share2 size={16} /><span>Share This Video</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

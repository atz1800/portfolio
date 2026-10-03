import { PROJECTS as STATIC_PROJECTS } from './projects.js';
import { SUPABASE_URL, SUPABASE_KEY, ADMIN_EMAIL, TABLE } from './supabase-config.js';

// ── Supabase init (dynamic — so a CDN failure doesn't break the whole page) ───
let supabase = null;
const supabaseReady = Promise.race([
  import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({ createClient }) => {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    return true;
  }),
  new Promise(resolve => setTimeout(() => resolve(false), 6000))
]).catch(() => false);

// ── State ─────────────────────────────────────────────────────────────────────
let isAdmin = false;
let allProjects = [];
let carouselIntervals = [];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid           = document.getElementById('projectsGrid');
const loadingEl      = document.getElementById('projectsLoading');
const template       = document.getElementById('cardTemplate');
const filterBtns     = document.querySelectorAll('.filter-btn');
const projectCountEl = document.getElementById('projectCount');
const filterStatus   = document.getElementById('filterStatus');
const reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)');

const adminBar       = document.getElementById('adminBar');
const adminEmail     = document.getElementById('adminEmail');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminGearBtn   = document.getElementById('adminGearBtn');
const adminNavBtn    = document.getElementById('adminNavBtn');

// ── Auth ──────────────────────────────────────────────────────────────────────
function handleAdminLinkClick(e) {
  if (isAdmin && adminBar) {
    e.preventDefault();
    adminBar.scrollIntoView({ behavior: 'smooth' });
  }
  // else: let the <a href="admin.html"> navigate naturally
}
adminGearBtn.addEventListener('click', handleAdminLinkClick);
if (adminNavBtn) adminNavBtn.addEventListener('click', handleAdminLinkClick);

adminLogoutBtn?.addEventListener('click', () => supabase?.auth.signOut());

// Set up auth listener once Supabase is ready
supabaseReady.then(ok => {
  if (!ok || !supabase) return;
  supabase.auth.onAuthStateChange((event, session) => {
    // index.html doesn't carry the admin bar — guard every ref (see 63de057)
    if (session && session.user && session.user.email === ADMIN_EMAIL) {
      isAdmin = true;
      if (adminEmail) adminEmail.textContent = session.user.email;
      adminBar?.classList.remove('hidden');
    } else {
      isAdmin = false;
      adminBar?.classList.add('hidden');
    }
    renderProjects(allProjects);
  });
});

// ── Card builder ──────────────────────────────────────────────────────────────
function buildCard(p, index = 99) {
  const card = template.content.cloneNode(true).querySelector('.project-card');
  card.dataset.category = p.category || 'app';
  if (p.docId) card.dataset.docId = p.docId;

  card.querySelector('.card-emoji').textContent = p.emoji || '📱';

  // Multi-image carousel or single image
  const galleryImgs = Array.isArray(p.images) && p.images.length > 0
    ? p.images.filter(Boolean)
    : [];
  const singleImg = p.imageUrl || p.image || null;
  const cardImageEl = card.querySelector('.card-image');
  const existingImg = card.querySelector('.card-img');

  if (galleryImgs.length > 1) {
    existingImg.remove();
    const carousel = document.createElement('div');
    carousel.className = 'card-carousel';
    galleryImgs.forEach((src, i) => {
      const img = document.createElement('img');
      img.className = 'carousel-slide' + (i === 0 ? ' active' : '');
      img.src = src;
      img.alt = i === 0 ? `צילום מסך — ${p.title}` : '';
      img.loading = 'lazy';
      carousel.appendChild(img);
    });
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    galleryImgs.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dots.appendChild(dot);
    });
    carousel.appendChild(dots);
    cardImageEl.insertBefore(carousel, cardImageEl.querySelector('.card-overlay'));
    let cur = 0;
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotEls  = carousel.querySelectorAll('.carousel-dot');
    // לא מסובבים תמונות למי שביקש פחות תנועה, ולא כשהלשונית מוסתרת
    if (reducedMotion.matches) return finishCard(card, p);
    const iid = setInterval(() => {
      if (document.hidden) return;
      slides[cur].classList.remove('active');
      dotEls[cur].classList.remove('active');
      cur = (cur + 1) % galleryImgs.length;
      slides[cur].classList.add('active');
      dotEls[cur].classList.add('active');
    }, 3500);
    carouselIntervals.push(iid);
  } else if (galleryImgs.length === 1 || singleImg) {
    const src = galleryImgs[0] || singleImg;
    // הכרטיסים הראשונים נטענים מיד — שלא ייראה אמוג'י מציץ במקום צילום המסך
    if (index < 9) existingImg.loading = 'eager';
    existingImg.src = src;
    existingImg.alt = `צילום מסך — ${p.title}`;
    if (existingImg.complete && existingImg.naturalWidth) existingImg.classList.add('loaded');
    existingImg.addEventListener('load', () => existingImg.classList.add('loaded'));
  }

  return finishCard(card, p);
}

function finishCard(card, p) {
  const linkBtn = card.querySelector('.card-link-btn');
  linkBtn.setAttribute('aria-label', `פתח את ${p.title} (נפתח בלשונית חדשה)`);
  if (p.link) {
    linkBtn.href = p.link;
    linkBtn.addEventListener('click', e => e.stopPropagation());
    // Make whole card clickable
    card.classList.add('card-clickable');
    card.addEventListener('click', () => window.open(p.link, '_blank', 'noopener,noreferrer'));
  } else {
    linkBtn.textContent = 'בקרוב';
    linkBtn.removeAttribute('href');
    linkBtn.removeAttribute('aria-label');
    linkBtn.style.pointerEvents = 'none';
    linkBtn.style.opacity = '0.5';
  }

  card.querySelector('.card-category-badge').textContent =
    p.category === 'web' ? 'אתר' : p.category === 'tool' ? 'כלי' : 'אפליקציה';
  card.querySelector('.card-year').textContent = p.year || '';
  card.querySelector('.card-title').textContent = p.title;
  // Table uses `description`, UI uses `desc` — support both
  card.querySelector('.card-desc').textContent = p.desc || p.description || '';

  const tagsEl = card.querySelector('.card-tags');
  (p.tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'card-tag';
    span.textContent = t;
    tagsEl.appendChild(span);
  });

  // Admin edit button — index.html has no edit modal, so open the project in admin.html
  if (isAdmin && p.docId) {
    const editBtn = document.createElement('a');
    editBtn.className = 'card-edit-btn';
    editBtn.href = `admin.html#edit=${encodeURIComponent(p.docId)}`;
    editBtn.title = 'ערוך פרויקט';
    editBtn.setAttribute('aria-label', `ערוך את ${p.title}`);
    editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.addEventListener('click', e => e.stopPropagation());
    card.querySelector('.card-image').appendChild(editBtn);
  }

  return card;
}

function renderProjects(projects) {
  carouselIntervals.forEach(id => clearInterval(id));
  carouselIntervals = [];
  grid.innerHTML = '';
  projects.forEach((p, i) => grid.appendChild(buildCard(p, i)));
  if (projectCountEl) {
    projectCountEl.textContent = projects.length > 9 ? `${projects.length}+` : projects.length;
  }
  updateFilterCounts(projects);
  // Re-apply active filter
  const activeFilter = document.querySelector('.filter-btn.active');
  applyFilter(activeFilter ? activeFilter.dataset.filter : 'all');
}

// ── Filter ────────────────────────────────────────────────────────────────────
// מספר פרויקטים ליד כל כפתור, וקטגוריה ריקה לא מוצגת בכלל
function updateFilterCounts(projects) {
  filterBtns.forEach(btn => {
    const cat = btn.dataset.filter;
    const n = cat === 'all' ? projects.length : projects.filter(p => (p.category || 'app') === cat).length;
    let countEl = btn.querySelector('.filter-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'filter-count';
      btn.appendChild(countEl);
    }
    countEl.textContent = n;
    btn.hidden = n === 0 && cat !== 'all';
  });
}

function applyFilter(cat) {
  let visible = 0;
  document.querySelectorAll('.project-card').forEach(card => {
    const hide = cat !== 'all' && card.dataset.category !== cat;
    card.classList.toggle('hidden', hide);
    if (!hide) visible++;
  });
  if (filterStatus) filterStatus.textContent = `מוצגים ${visible} פרויקטים`;
}

filterBtns.forEach(btn => {
  btn.setAttribute('aria-pressed', btn.classList.contains('active'));
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    applyFilter(btn.dataset.filter);
  });
});

// ── Footer year ───────────────────────────────────────────────────────────────
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Merge static + Supabase ───────────────────────────────────────────────────
// projects.js is the baseline (always shown). שורות מ-Supabase דורסות שדה-שדה,
// אבל רק כשיש בהן ערך — כך שעריכה בממשק הניהול לא מוחקת תמונה או תיאור מהקובץ,
// ופרויקט חדש בקובץ לא נעלם רק בגלל שהטבלה מלאה.
function staticBase() {
  return STATIC_PROJECTS.map(p => ({ ...p, docId: p.id }));
}

function hasValue(v) {
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

function mergeProjects(rows) {
  const merged = staticBase();
  const byId = new Map(merged.map(p => [p.id, p]));

  rows.forEach(row => {
    const remote = {
      docId:    row.id,
      id:       row.id,
      title:    row.title,
      desc:     row.description || row.desc || '',
      emoji:    row.emoji,
      link:     row.link,
      tags:     row.tags,
      category: row.category,
      year:     row.year,
      order:    row.order,
      imageUrl: row.image_url || row.imageUrl || null,
      images:   row.images || []
    };
    const base = byId.get(row.id);
    if (base) {
      Object.entries(remote).forEach(([k, v]) => { if (hasValue(v)) base[k] = v; });
    } else {
      merged.push(remote);
      byId.set(row.id, remote);
    }
  });

  return merged.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

// ── Initial load ──────────────────────────────────────────────────────────────
// Show static projects immediately — never leave the page blank
if (loadingEl) loadingEl.classList.add('hidden');
allProjects = staticBase();
renderProjects(allProjects);

// Upgrade to Supabase data in the background if available
supabaseReady.then(async ok => {
  if (!ok || !supabase) return;
  try {
    const { data, error } = await Promise.race([
      supabase.from(TABLE).select('*').order('order', { ascending: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    if (!error && data && data.length > 0) {
      allProjects = mergeProjects(data);
      renderProjects(allProjects);
    }
  } catch (_) {}
});

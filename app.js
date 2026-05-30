import { PROJECTS as STATIC_PROJECTS } from './projects.js';
import { SUPABASE_URL, SUPABASE_KEY, ADMIN_EMAIL, TABLE, BUCKET } from './supabase-config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/esm/index.js';

// ── Supabase init ─────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── State ─────────────────────────────────────────────────────────────────────
let isAdmin = false;
let allProjects = [];
let editingDocId = null;
let pendingImageFile = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const grid           = document.getElementById('projectsGrid');
const loadingEl      = document.getElementById('projectsLoading');
const template       = document.getElementById('cardTemplate');
const filterBtns     = document.querySelectorAll('.filter-btn');
const projectCountEl = document.getElementById('projectCount');

const adminBar       = document.getElementById('adminBar');
const adminEmail     = document.getElementById('adminEmail');
const addProjectBtn  = document.getElementById('addProjectBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminGearBtn   = document.getElementById('adminGearBtn');

const editModal      = document.getElementById('editModal');
const editModalTitle = document.getElementById('editModalTitle');
const editForm       = document.getElementById('editForm');
const closeModalBtn  = document.getElementById('closeModalBtn');
const saveModalBtn   = document.getElementById('saveModalBtn');
const saveBtnText    = document.getElementById('saveBtnText');
const saveBtnSpinner = document.getElementById('saveBtnSpinner');
const deleteModalBtn = document.getElementById('deleteModalBtn');

const mEditTitle     = document.getElementById('mEditTitle');
const mEditEmoji     = document.getElementById('mEditEmoji');
const mEditDesc      = document.getElementById('mEditDesc');
const mEditCategory  = document.getElementById('mEditCategory');
const mEditYear      = document.getElementById('mEditYear');
const mEditLink      = document.getElementById('mEditLink');
const mEditTags      = document.getElementById('mEditTags');
const mEditOrder     = document.getElementById('mEditOrder');
const mEditImageFile = document.getElementById('mEditImageFile');
const mEditImageUrl  = document.getElementById('mEditImageUrl');
const mEditPreviewImg= document.getElementById('mEditPreviewImg');
const mEditPreviewPH = document.getElementById('mEditPreviewPH');
const mEditProgress  = document.getElementById('mEditProgress');
const mEditProgFill  = document.getElementById('mEditProgFill');
const mEditProgText  = document.getElementById('mEditProgText');

const confirmDeleteOverlay  = document.getElementById('confirmDeleteOverlay');
const confirmDeleteName     = document.getElementById('confirmDeleteName');
const confirmDeleteYesBtn   = document.getElementById('confirmDeleteYesBtn');
const confirmDeleteNoBtn    = document.getElementById('confirmDeleteNoBtn');

const adminToast     = document.getElementById('adminToast');

// ── Auth ──────────────────────────────────────────────────────────────────────
adminGearBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  if (isAdmin) {
    adminBar.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  // Navigate to admin page for magic link login
  window.location.href = 'admin.html';
});

adminLogoutBtn.addEventListener('click', () => supabase.auth.signOut());

supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.user && session.user.email === ADMIN_EMAIL) {
    isAdmin = true;
    adminEmail.textContent = session.user.email;
    adminBar.classList.remove('hidden');
    renderProjects(allProjects); // re-render with edit buttons
  } else {
    isAdmin = false;
    adminBar.classList.add('hidden');
    renderProjects(allProjects); // re-render without edit buttons
  }
});

// ── Add Project button ────────────────────────────────────────────────────────
addProjectBtn.addEventListener('click', () => openNewModal());

// ── Card builder ──────────────────────────────────────────────────────────────
function buildCard(p) {
  const card = template.content.cloneNode(true).querySelector('.project-card');
  card.dataset.category = p.category || 'app';
  if (p.docId) card.dataset.docId = p.docId;

  card.querySelector('.card-emoji').textContent = p.emoji || '📱';

  const imgSrc = p.imageUrl || p.image || null;
  if (imgSrc) {
    const img = card.querySelector('.card-img');
    img.src = imgSrc;
    img.alt = p.title;
    img.addEventListener('load', () => img.classList.add('loaded'));
  }

  const linkBtn = card.querySelector('.card-link-btn');
  if (p.link) {
    linkBtn.href = p.link;
  } else {
    linkBtn.textContent = 'בקרוב';
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

  // Admin edit button
  if (isAdmin && p.docId) {
    const editBtn = document.createElement('button');
    editBtn.className = 'card-edit-btn';
    editBtn.title = 'ערוך פרויקט';
    editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(p.docId);
    });
    card.querySelector('.card-image').appendChild(editBtn);
  }

  return card;
}

function renderProjects(projects) {
  grid.innerHTML = '';
  projects.forEach(p => grid.appendChild(buildCard(p)));
  if (projectCountEl) {
    projectCountEl.textContent = projects.length > 9 ? `${projects.length}+` : projects.length;
  }
  // Re-apply active filter
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter && activeFilter.dataset.filter !== 'all') {
    const cat = activeFilter.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', card.dataset.category !== cat);
    });
  }
}

// ── Filter ────────────────────────────────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', cat !== 'all' && card.dataset.category !== cat);
    });
  });
});

// ── Initial load (Supabase or static) ────────────────────────────────────────
async function loadProjects() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('order', { ascending: true });

    if (!error && data && data.length > 0) {
      // Map `description` column → `desc` for UI compatibility
      return data.map(row => ({
        docId: row.id,
        ...row,
        desc: row.description || row.desc || ''
      }));
    }
  } catch (_) {
    // Network error or table not set up yet
  }
  return STATIC_PROJECTS;
}

loadProjects().then(projects => {
  if (loadingEl) loadingEl.classList.add('hidden');
  allProjects = projects;
  renderProjects(allProjects);
});

// ── Edit Modal ────────────────────────────────────────────────────────────────
function openNewModal() {
  editingDocId = null;
  editModalTitle.textContent = 'פרויקט חדש';
  editForm.reset();
  mEditYear.value = new Date().getFullYear().toString();
  mEditOrder.value = allProjects.length;
  mEditEmoji.value = '📱';
  clearImgPreview();
  pendingImageFile = null;
  deleteModalBtn.classList.add('hidden');
  showModal();
}

function openEditModal(docId) {
  const p = allProjects.find(x => x.docId === docId);
  if (!p) return;
  editingDocId = docId;
  editModalTitle.textContent = 'עריכת פרויקט';
  mEditTitle.value    = p.title || '';
  mEditEmoji.value    = p.emoji || '📱';
  mEditDesc.value     = p.desc || p.description || '';
  mEditCategory.value = p.category || 'app';
  mEditYear.value     = p.year || '';
  mEditLink.value     = p.link || '';
  mEditTags.value     = (p.tags || []).join(', ');
  mEditOrder.value    = p.order ?? '';
  mEditImageUrl.value = '';
  pendingImageFile = null;
  if (p.imageUrl) {
    showImgPreview(p.imageUrl);
    mEditImageUrl.value = p.imageUrl;
  } else {
    clearImgPreview();
  }
  deleteModalBtn.classList.remove('hidden');
  showModal();
}

function showModal() {
  editModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  mEditTitle.focus();
}

function hideModal() {
  editModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  editingDocId = null;
  pendingImageFile = null;
}

closeModalBtn.addEventListener('click', hideModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) hideModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) hideModal();
});

// ── Image preview in modal ────────────────────────────────────────────────────
mEditImageFile.addEventListener('change', () => {
  const file = mEditImageFile.files[0];
  if (!file) return;
  pendingImageFile = file;
  mEditImageUrl.value = '';
  const reader = new FileReader();
  reader.onload = e => showImgPreview(e.target.result);
  reader.readAsDataURL(file);
});

mEditImageUrl.addEventListener('input', () => {
  const url = mEditImageUrl.value.trim();
  if (url) {
    pendingImageFile = null;
    mEditImageFile.value = '';
    showImgPreview(url);
  } else {
    clearImgPreview();
  }
});

function showImgPreview(src) {
  mEditPreviewImg.src = src;
  mEditPreviewImg.classList.remove('hidden');
  mEditPreviewPH.classList.add('hidden');
}
function clearImgPreview() {
  mEditPreviewImg.src = '';
  mEditPreviewImg.classList.add('hidden');
  mEditPreviewPH.classList.remove('hidden');
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────
// NOTE: Run this SQL in Supabase SQL editor to set up storage policies:
//
//   create policy "Admin upload" on storage.objects for insert
//     with check (bucket_id = 'portfolio-images' and auth.email() = 'amichai85@gmail.com');
//
//   create policy "Public read" on storage.objects for select
//     using (bucket_id = 'portfolio-images');
//
async function uploadImage(file, docId) {
  mEditProgress.classList.remove('hidden');
  mEditProgFill.style.width = '0%';
  mEditProgText.textContent = 'מעלה...';

  const ext = file.name.split('.').pop();
  const path = `${docId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  mEditProgress.classList.add('hidden');

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── Save ──────────────────────────────────────────────────────────────────────
editForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!mEditTitle.value.trim()) {
    showToast('יש למלא שם פרויקט', 'error');
    mEditTitle.focus();
    return;
  }
  setSaving(true);

  try {
    const docId = editingDocId || crypto.randomUUID();
    let finalImageUrl = mEditImageUrl.value.trim() || null;

    if (pendingImageFile) {
      try {
        finalImageUrl = await uploadImage(pendingImageFile, docId);
      } catch (uploadErr) {
        showToast('שגיאה בהעלאת תמונה — ודא שהגדרת את מדיניות האחסון ב-Supabase', 'error');
        setSaving(false);
        return;
      }
    }

    const data = {
      id:          docId,
      title:       mEditTitle.value.trim(),
      emoji:       mEditEmoji.value.trim() || '📱',
      description: mEditDesc.value.trim(),
      link:        mEditLink.value.trim() || null,
      year:        mEditYear.value.trim() || new Date().getFullYear().toString(),
      category:    mEditCategory.value,
      order:       parseInt(mEditOrder.value) || 0,
      tags:        mEditTags.value.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl:    finalImageUrl
    };

    const { error } = await supabase.from(TABLE).upsert(data);
    if (error) throw error;

    // Update local state
    const localRecord = { ...data, docId, desc: data.description };
    const idx = allProjects.findIndex(x => x.docId === docId);
    if (idx >= 0) {
      allProjects[idx] = localRecord;
    } else {
      allProjects.push(localRecord);
    }
    allProjects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    renderProjects(allProjects);

    pendingImageFile = null;
    editingDocId = docId;
    showToast('נשמר בהצלחה ✓', 'success');
    hideModal();
  } catch (err) {
    showToast('שגיאה בשמירה: ' + err.message, 'error');
  } finally {
    setSaving(false);
  }
});

function setSaving(on) {
  saveModalBtn.disabled = on;
  saveBtnText.textContent = on ? 'שומר...' : 'שמור';
  saveBtnSpinner.classList.toggle('hidden', !on);
}

// ── Delete ────────────────────────────────────────────────────────────────────
deleteModalBtn.addEventListener('click', () => {
  const p = allProjects.find(x => x.docId === editingDocId);
  if (!p) return;
  confirmDeleteName.textContent = p.title;
  confirmDeleteOverlay.classList.remove('hidden');
});

confirmDeleteNoBtn.addEventListener('click', () => confirmDeleteOverlay.classList.add('hidden'));

confirmDeleteYesBtn.addEventListener('click', async () => {
  confirmDeleteOverlay.classList.add('hidden');
  if (!editingDocId) return;
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', editingDocId);
    if (error) throw error;

    allProjects = allProjects.filter(x => x.docId !== editingDocId);
    renderProjects(allProjects);

    hideModal();
    showToast('הפרויקט נמחק', 'success');
  } catch (err) {
    showToast('שגיאה במחיקה: ' + err.message, 'error');
  }
});

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  adminToast.textContent = msg;
  adminToast.className = `admin-toast show${type ? ' ' + type : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => adminToast.classList.remove('show'), 3500);
}
